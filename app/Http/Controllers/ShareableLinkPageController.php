<?php

namespace App\Http\Controllers;

use App\Models\FileEntry;
use App\Models\ShareableLink;
use App\Resources\DriveEntryResource;
use App\Resources\ShareableLinkResource;
use App\Services\Links\ValidatesLinkPassword;
use Common\API\ExcludeRoutesFromPublicDocs;
use Common\Core\Rendering\RendersClientSideApp;
use Dedoc\Scramble\Attributes\Group;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Arr;
use Illuminate\Pagination\Paginator;

#[Group('Links', weight: 1)]
#[ExcludeRoutesFromPublicDocs]
class ShareableLinkPageController extends Controller
{
    use ValidatesLinkPassword, RendersClientSideApp;

    /**
     * Retrieve or render shareable link page.
     *
     * @operationId getShareableLinkPageData
     * @response array{
     *     data: ShareableLinkResource|null,
     *     folderChildren: Paginator<DriveEntryResource>|null,
     *     password_invalid: bool,
     * }
     */
    public function __invoke(string $hash, Request $request)
    {
        $parts = explode(':', $hash);
        $entryHash = $parts[0];
        $folderHash = $parts[1] ?? null;

        $params = $request->validate([
            'sort' => 'string|nullable',
            'page' => 'string|nullable',
            'password' => 'string|nullable',
        ]);

        $link = ShareableLink::query()
            ->where('hash', $entryHash)
            ->firstOrFail();

        $folderChildren = null;

        // load sub folder for main link entry, if folderHash provided
        if ($folderHash) {
            $entry = FileEntry::whereHash($folderHash)->with('users')->first();
            $link->setRelation('entry', $entry);
        } else {
            $link->load('entry.users');
        }

        if (!$link || !$link->entry || $link->entry->trashed()) {
            abort(404);
        }

        Gate::authorize('show', $link);

        $passwordInvalid = !$this->linkPasswordIsValid($link);

        $data = (new ShareableLinkResource($link))->additional([
            'password_invalid' => $passwordInvalid,
        ]);

        if ($link->entry->type === 'folder') {
            $sortParts = explode(':', $params['sort'] ?? '');
            $orderBy = Arr::get($sortParts, 0) ?: 'created_at';
            $orderDir = Arr::get($sortParts, 1) ?: 'desc';
            $folderChildren = FileEntry::query()
                ->with('users')
                ->where('parent_id', $link->entry->id)
                ->orderBy(DB::raw('type = "folder"'), 'desc')
                ->orderBy($orderBy, $orderDir)
                ->orderBy('id', 'desc')
                ->simplePaginate(50);

            $folderChildren->through(
                fn($item) => new DriveEntryResource($item),
            );

            $data->additional([
                'folderChildren' => $folderChildren,
            ]);
        }

        // don't return data if password is invalid
        if ($passwordInvalid) {
            $data = [
                'password_invalid' => true,
            ];
        }

        return $this->clientSideOrPrerenderedResponse([
            'data' => $data,
            'loader' => 'shareableLinkPage',
            'pageName' => $passwordInvalid ? null : 'shareable-link-page',
        ]);
    }
}
