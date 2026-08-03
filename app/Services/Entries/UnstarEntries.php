<?php

namespace App\Services\Entries;

use App\Models\StarredEntry;

class UnstarEntries
{
    public function execute(array $entryIds, int $userId): void
    {
        StarredEntry::query()
            ->where('user_id', $userId)
            ->whereIn('file_entry_id', $entryIds)
            ->delete();
    }
}
