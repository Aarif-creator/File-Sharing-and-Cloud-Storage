<?php

namespace App\Http\Controllers;

use App\Models\Folder;
use App\Models\RootFolder;
use App\Resources\DriveEntryResource;
use Common\API\ExcludeRouteFromPublicDocs;
use Common\Workspaces\ActiveWorkspace;
use Dedoc\Scramble\Attributes\Group;
use Illuminate\Routing\Controller;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Gate;

#[Group('Files', weight: 1)]
class WorkspaceFoldersController extends Controller
{
    /**
     * Get all workspace folders in compact format.
     *
     * @operationId listWorkspaceFolders
     */
    #[ExcludeRouteFromPublicDocs]
    public function index()
    {
        Gate::allowIf(Auth::check());

        $query = Folder::query()->where(
            'workspace_id',
            ActiveWorkspace::get()->id,
        );

        $folders = $query
            ->with('users')
            ->orderByRaw('LENGTH(path)')
            ->limit(100)
            ->get();

        return DriveEntryResource::collection($folders)->additional([
            'rootFolder' => new DriveEntryResource(new RootFolder()),
        ]);
    }
}
