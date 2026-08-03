<?php

namespace App\Http\Controllers;

use App\Models\FileEntry;
use App\Resources\DriveEntryResource;
use App\Services\Entries\DriveEntriesLoader;
use Dedoc\Scramble\Attributes\Group;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\Gate;

#[Group('Files', weight: 1)]
class DriveEntriesController extends Controller
{
    /**
     * Retrieve file metadata.
     *
     * @operationId retrieveDriveEntryModel
     */
    public function showModel(int $id)
    {
        $fileEntry = FileEntry::query()->findOrFail($id);

        Gate::authorize('show', $fileEntry);

        $fileEntry->loadMissing('users');

        return new DriveEntryResource($fileEntry);
    }

    /**
     * List all files.
     *
     * @operationId listDriveEntries
     */
    public function index(Request $request)
    {
        Gate::authorize('index', FileEntry::class);

        $params = $request->validate([
            'section' => 'required|string',
            'folder_id' => 'nullable|string',
            'type' => 'nullable|string',
            'owner' => 'nullable|string|in:me,not_me',
            'created_at' => 'nullable|string',
            'updated_at' => 'nullable|string',
            'location' => 'nullable|string|in:trashed,starred',
            'sharing' =>
                'nullable|string|in:shared_with_me,shared_by_me,has_shareable_link',
            'query' => 'nullable|string',
            'per_page' => 'nullable|integer',
            'page' => 'nullable|integer',
            'sort' => 'nullable|string',
        ]);

        $result = (new DriveEntriesLoader($params))->load();

        return DriveEntryResource::collection($result->entries)->additional([
            'folder' => $result->folder
                ? new DriveEntryResource($result->folder)
                : null,
        ]);
    }

    /**
     * Update file metadata.
     *
     * @operationId updateDriveEntry
     */
    public function update(int $id, Request $request)
    {
        $entry = FileEntry::query()->findOrFail($id);

        Gate::authorize('update', $entry);

        $data = $request->validate([
            'name' => 'string|min:3|max:200',
            'description' => 'nullable|string|min:3|max:200',
            'tags' => 'nullable|array',
            'tags.*' => 'integer',
        ]);

        $entry->fill(Arr::except($data, 'tags'))->update();

        if (isset($data['tags'])) {
            $entry->tags()->sync($data['tags']);
        }

        return new DriveEntryResource($entry->loadMissing(['users', 'tags']));
    }
}
