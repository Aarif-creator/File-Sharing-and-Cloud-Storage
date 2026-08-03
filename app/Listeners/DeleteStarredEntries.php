<?php

namespace App\Listeners;

use App\Models\StarredEntry;
use Common\Auth\Events\UsersDeleted;
use Common\Files\Events\FileEntriesDeleted;

class DeleteStarredEntries
{
    public function handle(FileEntriesDeleted|UsersDeleted $event): void
    {
        if ($event instanceof FileEntriesDeleted) {
            if (!$event->permanently) {
                return;
            }

            StarredEntry::query()
                ->whereIn('file_entry_id', $event->entryIds)
                ->delete();

            return;
        }

        StarredEntry::query()
            ->whereIn('user_id', $event->users->pluck('id'))
            ->delete();
    }
}
