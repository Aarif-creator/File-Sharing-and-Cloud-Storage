<?php

namespace App\Http\Controllers;

use App\Models\FileRequest;
use App\Resources\FileRequestResource;
use App\Services\FileRequests\ValidatesFileRequestPassword;
use Common\API\ExcludeRoutesFromPublicDocs;
use Common\Core\Rendering\RendersClientSideApp;
use Dedoc\Scramble\Attributes\Group;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Gate;

#[Group('File requests', weight: 2)]
#[ExcludeRoutesFromPublicDocs]
class FileRequestPageController extends Controller
{
    use ValidatesFileRequestPassword, RendersClientSideApp;

    /**
     * Retrieve or render the public file request page.
     *
     * @operationId getFileRequestPageData
     * @response array{
     *     data: FileRequestResource|null,
     *     password_invalid: bool,
     *     password_protected: bool,
     * }
     */
    public function __invoke(string $hash, Request $request)
    {
        $request->validate([
            'password' => 'string|nullable',
        ]);

        $fileRequest = FileRequest::query()
            ->where('hash', $hash)
            ->with(['folder', 'user'])
            ->firstOrFail();

        Gate::authorize('show', $fileRequest);

        $passwordInvalid =
            !$this->passwordIsValid($fileRequest) &&
            $fileRequest->user_id !== Auth::id();

        $aditional = [
            'password_protected' => $fileRequest->password !== null,
            'password_invalid' => $passwordInvalid,
        ];

        $data = $passwordInvalid
            ? $aditional
            : (new FileRequestResource($fileRequest))->additional($aditional);

        return $this->clientSideOrPrerenderedResponse([
            'data' => $data,
        ]);
    }
}
