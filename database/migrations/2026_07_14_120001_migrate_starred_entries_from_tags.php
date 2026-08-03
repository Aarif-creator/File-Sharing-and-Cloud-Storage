<?php

use App\Models\FileEntry;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration {
    public function up(): void
    {
        $starredTagIds = DB::table('tags')->where('name', 'starred')->pluck('id');

        if ($starredTagIds->isEmpty()) {
            return;
        }

        DB::table('taggables')
            ->whereIn('tag_id', $starredTagIds)
            ->where('taggable_type', FileEntry::MODEL_TYPE)
            ->whereNotNull('user_id')
            ->select('id', 'taggable_id as file_entry_id', 'user_id')
            ->orderBy('id')
            ->chunkById(500, function ($records) {
                $now = now();

                DB::table('starred_entries')->insertOrIgnore(
                    $records
                        ->map(
                            fn($record) => [
                                'user_id' => $record->user_id,
                                'file_entry_id' => $record->file_entry_id,
                                'created_at' => $now,
                                'updated_at' => $now,
                            ],
                        )
                        ->all(),
                );
            });
    }

    public function down(): void
    {
        DB::table('starred_entries')->truncate();
    }
};
