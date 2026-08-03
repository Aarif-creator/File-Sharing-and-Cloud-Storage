<?php

namespace App\Services;

use App\Models\RootFolder;
use App\Resources\DriveEntryResource;
use Common\Core\Bootstrap\BaseBootstrapData;
use Common\Workspaces\ActiveWorkspace;
use Common\Workspaces\Resources\WorkspaceResource;
use Illuminate\Support\Facades\Auth;

class AppBootstrapData extends BaseBootstrapData
{
    public function init(): self
    {
        parent::init();

        // need to fetch workspaceId from cookie as there will be no request from client at this point yet
        if (Auth::check()) {
            $this->data['rootFolder'] = new DriveEntryResource(
                new RootFolder(),
            );
            $this->data['workspaces'] = WorkspaceResource::collection(
                ActiveWorkspace::getAll(),
            );
        }

        return $this;
    }

    protected function getAuthRedirectUri(): string
    {
        return '/drive';
    }
}
