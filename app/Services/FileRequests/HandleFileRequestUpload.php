<?php

namespace App\Services\FileRequests;

use App\Models\FileRequest;
use App\Models\FileRequestUpload;
use App\Models\User;
use App\Notifications\FileRequestUploadNotif;
use Common\Files\FileEntry;
use Exception;
use Illuminate\Support\Arr;

class HandleFileRequestUpload
{
    public function execute(FileEntry $entry, array $data): FileEntry
    {
        $fileRequest = FileRequest::query()
            ->where('hash', request('fileRequest'))
            ->first();

        if (!$fileRequest) {
            return $entry;
        }

        $uploaderName =
            trim((string) Arr::get($data, 'uploaderName')) ?: __('Someone');
        $uploaderEmail = Arr::get($data, 'uploaderEmail') ?: null;

        FileRequestUpload::query()->create([
            'file_request_id' => $fileRequest->id,
            'entry_id' => $entry->id,
            'uploader_name' => $uploaderName,
            'uploader_email' => $uploaderEmail,
        ]);

        $fileRequest->increment('uploads_count', 1);

        if (settings('drive.send_file_request_notification')) {
            try {
                User::query()
                    ->find($fileRequest->user_id)
                    ?->notify(
                        new FileRequestUploadNotif(
                            requestTitle: $fileRequest->title,
                            folderHash: $fileRequest->folder->hash,
                            uploaderName: $uploaderName,
                            fileName: $entry->name,
                        ),
                    );
            } catch (Exception $e) {
                report($e);
            }
        }

        return $entry;
    }
}
