<?php

namespace App\Http\Controllers;

use App\Models\FileEntry;
use App\Resources\DriveEntryResource;
use App\Services\Entries\CreateFolder;
use App\Services\Entries\FolderExistsException;
use Common\Files\Events\FileEntryCreated;
use Dedoc\Scramble\Attributes\Group;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Gate;
use Illuminate\Validation\ValidationException;

#[Group('Files', weight: 1)]
class FoldersController extends Controller
{
    /**
     * Create a new folder.
     *
     * @operationId createFolder
     */
    public function store(Request $request)
    {
        $data = $request->validate([
            'name' => 'required|string|min:3',
            'parent_id' => 'nullable|integer|exists:file_entries,id',
        ]);

        Gate::authorize('store', [
            FileEntry::class,
            $data['parent_id'] ?? null,
        ]);

        try {
            $folder = (new CreateFolder())->execute([
                'name' => $data['name'],
                'parent_id' => $data['parent_id'],
                'owner_id' => Auth::id(),
            ]);
        } catch (FolderExistsException) {
            throw ValidationException::withMessages([
                'name' => __('Folder with same name already exists.'),
            ]);
        }

        event(new FileEntryCreated($folder));

        return new DriveEntryResource($folder->loadMissing('users'));
    }
}
