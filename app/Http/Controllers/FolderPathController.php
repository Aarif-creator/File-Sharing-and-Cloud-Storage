<?php

namespace App\Http\Controllers;

use App\Models\Folder;
use App\Models\ShareableLink;
use App\Resources\DriveEntryResource;
use App\Services\Entries\GetEntryPermissions;
use Common\Core\BaseController;
use Common\Files\Traits\HashesId;
use Dedoc\Scramble\Attributes\Group;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Routing\Controller;
use Illuminate\Support\Facades\Gate;

#[Group('Files', weight: 1)]
class FolderPathController extends Controller
{
    use HashesId;

    /**
     * Get full path for a folder.
     *
     * @operationId getFolderPath
     */
    public function show(string $hash, Request $request)
    {
        $request->validate([
            'shareable_link' => 'nullable|string',
            'password' => 'nullable|string',
        ]);

        $folder = Folder::with(['users', 'tags'])
            ->byIdOrHash($hash)
            ->firstOrFail();

        $link = request('shareable_link')
            ? ShareableLink::findOrFail(request('shareable_link'))
            : null;

        Gate::authorize('show', [$folder, $link]);

        $path = $folder
            ->allParents()
            ->select(['id', 'name', 'path', 'type'])
            ->with(['users', 'tags'])
            ->get();

        $path[] = $folder;

        $path = $path
            // if path is for shareable link, only return path up to the folder that the link is for
            ->filter(function (Folder $folder) use ($link) {
                if (!$link) {
                    return true;
                }
                return str_contains($folder->path, $link->entry_id);
            });

        return DriveEntryResource::collection($path->values());
    }
}
