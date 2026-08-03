<?php

namespace App\Http\Controllers;

use App\Http\Requests\CrupdateFileRequestRequest;
use App\Models\FileEntry;
use App\Models\FileRequest;
use App\Notifications\FileRequestLinkNotif;
use App\QueryBuilders\FileRequestsQueryBuilder;
use App\Resources\FileRequestResource;
use App\Services\FileRequests\CrupdateFileRequest;
use Dedoc\Scramble\Attributes\Group;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Notification;

#[Group('File requests', weight: 2)]
class FileRequestsController extends Controller
{
    /**
     * List file requests.
     *
     * @operationId listFileRequests
     */
    public function index(Request $request)
    {
        Gate::authorize('index', FileRequest::class);

        $data = $request->validate([
            'query' => 'nullable|string',
            'per_page' => 'integer|min:1|max:100',
            'page' => 'integer|min:1',
            'sort' => 'string',
            'workspace_id' => 'string',
            'created_at' => 'string',
            'updated_at' => 'string',
            'deadline' => 'string',
            'closed_at' => 'string',
        ]);

        $pagination = (new FileRequestsQueryBuilder($data))->paginate();

        return FileRequestResource::collection($pagination);
    }

    /**
     * Retrieve a file request.
     *
     * @operationId retrieveFileRequest
     */
    public function show(int $id)
    {
        $fileRequest = FileRequest::query()->with('folder')->findOrFail($id);

        Gate::authorize('show', $fileRequest);

        return new FileRequestResource($fileRequest);
    }

    /**
     * Create a new file request.
     *
     * @operationId createFileRequest
     */
    public function store(CrupdateFileRequestRequest $request)
    {
        Gate::authorize('create', FileRequest::class);

        $data = $request->validated();

        // user picked an existing folder, make sure they can actually write into it
        if ($folderId = $data['folder_id'] ?? null) {
            Gate::authorize('store', [FileEntry::class, $folderId]);
        }

        $fileRequest = (new CrupdateFileRequest())->execute($data);

        return new FileRequestResource($fileRequest->load('folder'));
    }

    /**
     * Update a file request.
     *
     * @operationId updateFileRequest
     */
    public function update(int $id, CrupdateFileRequestRequest $request)
    {
        $fileRequest = FileRequest::query()->findOrFail($id);

        Gate::authorize('update', $fileRequest);

        (new CrupdateFileRequest())->execute(
            $request->validated(),
            $fileRequest,
        );

        return new FileRequestResource($fileRequest->load('folder'));
    }

    /**
     * Close a file request.
     *
     * @operationId closeFileRequest
     */
    public function close(int $id)
    {
        $fileRequest = FileRequest::query()->findOrFail($id);

        Gate::authorize('update', $fileRequest);

        $fileRequest->fill(['closed_at' => now()])->save();

        return new FileRequestResource($fileRequest->load('folder'));
    }

    /**
     * Reopen a closed file request.
     *
     * @operationId reopenFileRequest
     */
    public function reopen(int $id)
    {
        $fileRequest = FileRequest::query()->findOrFail($id);

        Gate::authorize('update', $fileRequest);

        $fileRequest->fill(['closed_at' => null])->save();

        return new FileRequestResource($fileRequest->load('folder'));
    }

    /**
     * Send file request link via email.
     *
     * @operationId sendFileRequestEmail
     */
    public function sendEmail(int $id, Request $request)
    {
        $fileRequest = FileRequest::query()->findOrFail($id);

        Gate::authorize('update', $fileRequest);

        $data = $request->validate([
            'emails' => ['required', 'array', 'min:1', 'max:10'],
            'emails.*.email' => ['required', 'email'],
        ]);

        $emails = collect($data['emails'])->pluck('email')->unique()->values();

        $notification = new FileRequestLinkNotif(
            $fileRequest,
            Auth::user()->name,
        );

        foreach ($emails as $email) {
            Notification::route('mail', $email)->notify($notification);
        }

        return response()->noContent();
    }

    /**
     * Delete a file request.
     *
     * @operationId deleteFileRequest
     */
    public function destroy(int $id)
    {
        $fileRequest = FileRequest::query()->findOrFail($id);

        Gate::authorize('destroy', $fileRequest);

        // uploaded files stay in the owner's drive, only the request goes away
        $fileRequest->uploads()->delete();
        $fileRequest->delete();

        return response()->noContent();
    }
}
