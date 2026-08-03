<?php

namespace App\Policies;

use App\Models\FileRequest;
use App\Models\ShareableLink;
use App\Models\User;
use App\Services\Links\ValidatesLinkPassword;
use Common\Core\Policies\FileEntryPolicy;
use Common\Core\Policies\PolicyFailReason;
use Common\Files\FileEntry;
use Common\Settings\Settings;
use Common\Workspaces\ActiveWorkspace;
use Illuminate\Http\Request;
use Illuminate\Support\Arr;
use Illuminate\Auth\Access\Response;
use Illuminate\Support\Facades\Hash;

class DriveFileEntryPolicy extends FileEntryPolicy
{
    use ValidatesLinkPassword;

    public function __construct(
        protected Request $request,
        protected Settings $settings,
        protected ActiveWorkspace $activeWorkspace,
    ) {
        parent::__construct($this->request, $this->settings);
    }

    public function index(
        ?User $currentUser,
        array|null $entryIds = null,
        int|null $userId = null,
    ): bool {
        // if we're requesting resources for a particular workspace, let user view the resources
        // as long as they are a member, even without explicit "files.view" permission
        if (
            !$entryIds &&
            ActiveWorkspace::shouldScopeToWorkspace() &&
            ActiveWorkspace::get()->isMember($currentUser)
        ) {
            return true;
        }

        return parent::index($currentUser, $entryIds, $userId);
    }

    public function show(
        ?User $user,
        FileEntry $entry,
        ShareableLink|null $link = null,
    ): bool {
        if (($link = $this->getLinkForRequest($link)) !== null) {
            return $this->authorizeShareableLink($link, $entry);
        }

        return parent::show($user, $entry);
    }

    public function download(
        User $user,
        mixed $entries,
        ShareableLink|null $link = null,
    ): bool {
        if (($link = $this->getLinkForRequest($link)) !== null) {
            // shareable link is always for one entry only
            return $this->authorizeShareableLink($link, $entries[0]);
        }

        return parent::download($user, $entries);
    }

    public function store(
        ?User $user,
        int|null $parentId = null,
        string|null $uploadType = null,
    ): bool {
        if (request('fileRequest')) {
            return $this->authorizeViaFileRequest(request('fileRequest'));
        }

        if (!$user) {
            return false;
        }

        return parent::store($user, $parentId, $uploadType);
    }

    protected function userCan(
        User $currentUser,
        string $permission,
        mixed $entries,
    ) {
        $entries = $this->findEntries($entries);

        // first run regular checks (user has global permission, or owns entry)
        if (parent::userCan($currentUser, $permission, $entries)) {
            return true;
        }

        $activeWorkspace = ActiveWorkspace::get();

        if (!$activeWorkspace) {
            return Response::deny(
                'No workspace found',
                PolicyFailReason::NO_PERMISSION,
            );
        }

        // first check if user is a member of active workspace
        if (
            ($workspaceMember = $activeWorkspace->findMember($currentUser)) !==
            null
        ) {
            // then check if user has specified permission for all the entries
            return $entries->every(function (FileEntry $entry) use (
                $permission,
                $workspaceMember,
                $activeWorkspace,
            ) {
                $entryIsInWorkspace =
                    (int) $entry->workspace_id === $activeWorkspace->id;
                // file entry listing will be restricted in the builder query, no need to error here if user has no permission
                if ($permission === 'files.view') {
                    return $entryIsInWorkspace;
                } else {
                    return $entryIsInWorkspace &&
                        $workspaceMember->hasPermission($permission);
                }
            });
        }

        return false;
    }

    private function authorizeShareableLink(
        ShareableLink $link,
        FileEntry $entry,
    ): bool {
        // check password first, if needed
        if (!$this->linkPasswordIsValid($link)) {
            return false;
        }

        // user can view this file if file or any of its parents is attached to specified link
        $entryPath = explode('/', $entry->path);
        $link = Arr::first(
            $entryPath,
            fn($entryId) => (int) $entryId === $link->entry_id,
        );

        return $link ?? false;
    }

    private function getLinkForRequest(
        ShareableLink|null $link = null,
    ): ?ShareableLink {
        if ($link !== null) {
            return $link;
        }

        if (request()->has('shareable_link')) {
            $linkId = request('shareable_link');
            return ShareableLink::findOrFail($linkId);
        }

        return null;
    }

    private function authorizeViaFileRequest(string $fileRequestHash): bool
    {
        $fileRequest = FileRequest::query()
            ->where('hash', $fileRequestHash)
            ->with('folder')
            ->first();

        if (
            !$fileRequest ||
            !$fileRequest->acceptsUploads() ||
            ($fileRequest->folder && $fileRequest->folder->trashed())
        ) {
            return false;
        }

        if ($fileRequest->password) {
            return Hash::check(
                request('fileRequestPassword'),
                $fileRequest->password,
            );
        }

        return true;
    }
}
