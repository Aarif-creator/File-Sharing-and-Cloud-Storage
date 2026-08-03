<?php

namespace App\Services\Links;

use App\Models\ShareableLink;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;

trait ValidatesLinkPassword
{
    private function linkPasswordIsValid(ShareableLink $link): bool
    {
        // link has no password
        if (!$link->password) {
            return true;
        }
        if ($link->user_id === Auth::id()) {
            return true;
        }

        return Hash::check(request('password'), $link->password);
    }
}
