<?php

namespace App\Services\Entries;

use App\Models\FileEntry;
use App\Models\RootFolder;
use Illuminate\Pagination\Paginator;

class DriveEntriesLoadResult
{
    public function __construct(
        public Paginator $entries,
        public FileEntry|RootFolder|null $folder = null,
    ) {}
}
