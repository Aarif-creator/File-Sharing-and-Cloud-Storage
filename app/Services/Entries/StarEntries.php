<?php

namespace App\Services\Entries;

use App\Models\StarredEntry;

class StarEntries
{
    public function execute(array $entryIds, int $userId): void
    {
        $now = now();

        StarredEntry::query()->upsert(
            collect($entryIds)
                ->map(
                    fn($entryId) => [
                        'user_id' => $userId,
                        'file_entry_id' => (int) $entryId,
                        'created_at' => $now,
                        'updated_at' => $now,
                    ],
                )
                ->all(),
            ['user_id', 'file_entry_id'],
            ['updated_at'],
        );
    }
}
