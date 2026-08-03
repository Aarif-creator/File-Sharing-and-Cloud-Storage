<?php

namespace App\Services\Entries;

use App\Services\FileRequests\HandleFileRequestUpload;
use Common\Files\FileEntry;

class DriveUploadHandler
{
    public function handle(FileEntry $entry, array $data): FileEntry
    {
        if (request('fileRequest')) {
            return (new HandleFileRequestUpload())->execute($entry, $data);
        }

        return $entry;
    }
}
