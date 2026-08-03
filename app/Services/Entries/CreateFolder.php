<?php

namespace App\Services\Entries;

use App\Models\Folder;
use Common\Workspaces\ActiveWorkspace;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\Auth;

class CreateFolder
{
    public function execute(array $data): Folder
    {
        $ownerId = $data['owner_id'];
        $parentId = Arr::get($data, 'parent_id')
            ? Arr::get($data, 'parent_id')
            : null;
        $folderName = $data['name'];
        $workspaceId =
            $data['workspace_id'] ?? (new ActiveWorkspace())->get()?->id;

        $exists = Folder::query()
            ->where('parent_id', $parentId)
            ->when(
                $workspaceId,
                fn($query) => $query->where('workspace_id', $workspaceId),
            )
            ->where('name', $folderName)
            ->where('type', 'folder')
            ->where('owner_id', $ownerId)
            ->first();

        if (!is_null($exists)) {
            throw new FolderExistsException();
        }

        $folder = Folder::create([
            'name' => $folderName,
            'file_name' => $folderName,
            'parent_id' => $parentId,
            'owner_id' => $ownerId,
            'workspace_id' => $workspaceId,
        ]);

        $folder->generatePath();

        $folder->users()->attach($ownerId, ['owner' => true]);

        return $folder;
    }
}
