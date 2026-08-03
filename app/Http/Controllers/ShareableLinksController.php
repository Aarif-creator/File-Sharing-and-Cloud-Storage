<?php

namespace App\Http\Controllers;

use App\Http\Requests\CrupdateShareableLinkRequest;
use App\Models\FileEntry;
use App\Models\ShareableLink;
use App\Resources\ShareableLinkResource;
use App\Services\Entries\DuplicateEntries;
use App\Services\Links\CrupdateShareableLink;
use App\Services\Links\ValidatesLinkPassword;
use Common\API\ExcludeRouteFromPublicDocs;
use Common\Core\Rendering\RendersClientSideApp;
use Common\Workspaces\ActiveWorkspace;
use Dedoc\Scramble\Attributes\Group;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Gate;

#[Group('Links', weight: 1)]
class ShareableLinksController extends Controller
{
    use ValidatesLinkPassword, RendersClientSideApp;

    /**
     * Retrieve a shareable link.
     *
     * @operationId retrieveShareableLink
     * @response array{data: ShareableLinkResource|null}
     */
    public function show(int $entryId, Request $request)
    {
        $link = ShareableLink::query()
            ->where('entry_id', $entryId)
            ->with('entry')
            ->first();

        if (!$link || !$link->entry || $link->entry->trashed()) {
            return response()->json(['data' => null]);
        }

        Gate::authorize('show', $link);

        return new ShareableLinkResource($link);
    }

    /**
     * Create a new shareable link.
     *
     * @operationId createShareableLink
     */
    public function store(
        int $entryId,
        CrupdateShareableLinkRequest $request,
        CrupdateShareableLink $action,
    ) {
        Gate::authorize('create', ShareableLink::class);
        Gate::authorize('update', [FileEntry::class, [$entryId]]);

        $data = $request->validate([
            'enable_direct_links' => 'nullable|boolean',
            'allow_direct' => 'nullable|boolean',
            'allow_download' => 'nullable|boolean',
            'allow_edit' => 'nullable|boolean',
        ]);

        $data['user_id'] = Auth::id();
        $data['entry_id'] = $entryId;

        if (
            Arr::get($data, 'enable_direct_links') &&
            !isset($data['allow_direct'])
        ) {
            $data['allow_direct'] = true;
        }

        $existingLink = ShareableLink::query()
            ->where('entry_id', $entryId)
            ->first();
        $link = $existingLink ?: $action->execute($data, $entryId);

        return new ShareablelinkResource($link);
    }

    /**
     * Update a shareable link.
     *
     * @operationId updateShareableLink
     */
    public function update(
        int $entryId,
        CrupdateShareableLinkRequest $request,
        CrupdateShareableLink $action,
    ) {
        $link = ShareableLink::query()
            ->where('entry_id', $entryId)
            ->firstOrFail();

        Gate::authorize('update', $link);

        $data = $request->validated();
        $data['user_id'] = Auth::id();

        $action->execute($data, $entryId, $link);

        return new ShareableLinkResource($link);
    }

    /**
     * Delete a shareable link.
     *
     * @operationId deleteShareableLink
     */
    public function destroy(int $entryId)
    {
        $link = ShareableLink::query()
            ->where('entry_id', $entryId)
            ->firstOrFail();

        Gate::authorize('destroy', $link);

        $link->delete();

        return response()->noContent();
    }

    /**
     * Import a shareable link into the user's own drive.
     *
     * @operationId importIntoOwnDrive
     */
    #[ExcludeRouteFromPublicDocs]
    public function importIntoOwnDrive(int $linkId)
    {
        $link = ShareableLink::query()->where('id', $linkId)->firstOrFail();

        Gate::authorize('importIntoOwnDrive', $link);

        (new DuplicateEntries(
            entryIds: [$link->entry_id],
            destinationId: null,
            ownerId: Auth::id(),
            workspaceId: (new ActiveWorkspace())->get()->id,
        ))->execute();

        return response()->noContent();
    }
}
