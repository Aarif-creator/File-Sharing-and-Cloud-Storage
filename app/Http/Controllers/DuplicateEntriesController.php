<?php

namespace App\Http\Controllers;

use App\Models\FileEntry;
use App\Resources\DriveEntryResource;
use App\Services\Entries\DuplicateEntries;
use Dedoc\Scramble\Attributes\Group;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;
use Illuminate\Support\Facades\Gate;

#[Group('Files', weight: 1)]
class DuplicateEntriesController extends Controller
{
    /**
     * Duplicate files
     *
     * @operationId duplicateEntries
     */
    public function duplicate(Request $request)
    {
        $data = $request->validate([
            'entryIds' => 'required|array',
            'entryIds.*' => 'required|integer',
            'destinationId' => 'nullable|integer|exists:file_entries,id',
        ]);

        $destinationId = $data['destinationId'] ?? null;

        Gate::authorize('index', [FileEntry::class, $data['entryIds']]);

        $copies = (new DuplicateEntries(
            entryIds: $data['entryIds'],
            destinationId: $destinationId,
        ))->execute();

        return DriveEntryResource::collection($copies);
    }
}
