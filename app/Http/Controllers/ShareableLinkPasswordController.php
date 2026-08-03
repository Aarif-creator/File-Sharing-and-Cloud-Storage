<?php

namespace App\Http\Controllers;

use App\Models\ShareableLink;
use Common\API\ExcludeRoutesFromPublicDocs;
use Dedoc\Scramble\Attributes\Group;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

#[Group('Links', weight: 1)]
#[ExcludeRoutesFromPublicDocs]
class ShareableLinkPasswordController extends Controller
{
    /**
     * Check if the password matches the link password.
     *
     * @operationId checkLinkPassword
     */
    public function check(string $hash, Request $request): JsonResponse
    {
        $data = $request->validate([
            'password' => 'required|string',
        ]);

        $link = ShareableLink::query()->where('hash', $hash)->firstOrFail();

        if (!Hash::check($data['password'], $link->password)) {
            throw ValidationException::withMessages([
                'password' => 'Invalid password',
            ]);
        }

        return response()->json([
            'matches' => true,
        ]);
    }
}
