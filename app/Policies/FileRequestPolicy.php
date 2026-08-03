<?php

namespace App\Policies;

use App\Models\FileRequest;
use App\Models\User;
use Common\Core\Policies\BasePolicy;
use Illuminate\Auth\Access\HandlesAuthorization;

class FileRequestPolicy extends BasePolicy
{
    use HandlesAuthorization;

    public function index(?User $user): bool
    {
        return $this->hasPermission($user, 'file_requests.view');
    }

    public function show(?User $user, FileRequest $fileRequest): bool
    {
        if ($user && $fileRequest->user_id === $user->id) {
            return true;
        }

        return $this->hasPermission($user, 'file_requests.view');
    }

    public function create(User $user): bool
    {
        return $this->hasPermission($user, 'file_requests.create') ||
            $this->hasPermission($user, 'file_requests.update');
    }

    public function update(User $user, FileRequest $fileRequest): bool
    {
        return $fileRequest->user_id === $user->id ||
            $this->hasPermission($user, 'file_requests.update');
    }

    public function destroy(User $user, FileRequest $fileRequest): bool
    {
        return $fileRequest->user_id === $user->id ||
            $this->hasPermission($user, 'file_requests.delete');
    }
}
