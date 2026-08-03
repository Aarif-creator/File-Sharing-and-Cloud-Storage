<?php

namespace App\Http\Controllers;

use App\Models\FileRequest;
use Common\API\ExcludeRoutesFromPublicDocs;
use Dedoc\Scramble\Attributes\Group;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

#[Group('File requests', weight: 2)]
#[ExcludeRoutesFromPublicDocs]
class FileRequestPasswordController extends Controller
{
    /**
     * Check if the password matches the file request password.
     *
     * @operationId checkFileRequestPassword
     */
    public function check(string $hash, Request $request): JsonResponse
    {
        $data = $request->validate([
            'password' => 'required|string',
        ]);

        $fileRequest = FileRequest::query()
            ->where('hash', $hash)
            ->firstOrFail();

        if (
            !$fileRequest->password ||
            !Hash::check($data['password'], $fileRequest->password)
        ) {
            throw ValidationException::withMessages([
                'password' => 'Invalid password',
            ]);
        }

        return response()->json([
            'matches' => true,
        ]);
    }
}
