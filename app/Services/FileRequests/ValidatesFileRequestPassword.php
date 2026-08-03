<?php

namespace App\Services\FileRequests;

use App\Models\FileRequest;
use Illuminate\Support\Facades\Hash;

trait ValidatesFileRequestPassword
{
    /**
     * Whether the password submitted with the current request unlocks this file request.
     *
     * Deliberately does not consider the currently authenticated user, because this
     * runs from global middleware, before any auth guard has resolved.
     */
    private function passwordIsValid(FileRequest $fileRequest): bool
    {
        if (!$fileRequest->password) {
            return true;
        }

        return Hash::check(request('password'), $fileRequest->password);
    }
}
