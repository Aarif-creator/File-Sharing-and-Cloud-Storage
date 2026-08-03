<?php

namespace App\Services\Entries;

use Common\Files\FileEntry;
use App\Models\User;
use App\Policies\DriveFileEntryPolicy;
use Common\Workspaces\ActiveWorkspace;
use Common\Workspaces\Models\Workspace;
use Illuminate\Support\Facades\Auth;

/**
 * The "execute" method will be called a few hundred or more times per request
 * so it needs to be as fast as possible and cache as much stuff as possible.
 */
class GetEntryPermissions
{
    private Workspace|null $activeWorkspace;
    private array|null $workspacePermissions = null;
    private User|null $user;
    private DriveFileEntryPolicy $policy;

    private array $directPermissions = [];

    private array $permissionToCheck = [
        'files.view',
        'files.update',
        'files.create',
        'files.download',
        'files.delete',
    ];

    public function __construct()
    {
        $this->user = Auth::user();
        $this->policy = app(DriveFileEntryPolicy::class);
        $this->activeWorkspace = ActiveWorkspace::get(createIfNotFound: false);
    }

    public function execute(FileEntry $entry): array
    {
        $entryPermissions = [];
        $entryUser = collect($entry['users'] ?? [])->first(
            fn($entryUser) => $entryUser['id'] === $this->user?->id,
        );

        foreach ($this->permissionToCheck as $permission) {
            $entryPermissions[$permission] =
                $this->hasDirectPermission($permission) ||
                $this->policy->userOwnsEntryOrWasGrantedPermission(
                    $entryUser,
                    $permission,
                ) ||
                $this->userHasPermissionViaWorkspace($permission);
        }

        return $entryPermissions;
    }

    protected function hasDirectPermission(string $permission): bool
    {
        // user always has "files.create" permission, ignore it
        if ($permission === 'files.create') {
            return false;
        }

        if (empty($this->directPermissions)) {
            foreach ($this->permissionToCheck as $permissionToCheck) {
                $this->directPermissions[$permissionToCheck] =
                    $this->user?->hasPermission($permissionToCheck) ?? false;
            }
        }

        return $this->directPermissions[$permission];
    }

    protected function userHasPermissionViaWorkspace(string $permission): bool
    {
        if (!$this->activeWorkspace) {
            return false;
        }

        if (
            $this->activeWorkspace->owner_id === $this->user?->id ||
            $this->activeWorkspace->is_personal
        ) {
            return true;
        }

        if (!$this->workspacePermissions && $this->user) {
            $this->workspacePermissions =
                $this->activeWorkspace
                    ->findMember($this->user)
                    ?->permissions->pluck('name')
                    ->toArray() ?? [];
        }

        return in_array($permission, $this->workspacePermissions);
    }
}
