<?php

namespace App\Services\FileRequests;

use App\Models\FileRequest;
use App\Models\Folder;
use App\Services\Entries\CreateFolder;
use Carbon\Carbon;
use Common\Workspaces\ActiveWorkspace;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;

class CrupdateFileRequest
{
    const ROOT_FOLDER_NAME = 'File requests';

    public function execute(
        array $params,
        FileRequest|null $fileRequest = null,
    ): FileRequest {
        $attributes = [
            'title' => $params['title'],
            'description' => Arr::get($params, 'description') ?: null,
            'allow_late_uploads' =>
                Arr::get($params, 'allow_late_uploads') ?? false,
            'deadline' => Arr::get($params, 'deadline')
                ? Carbon::parse($params['deadline'])
                : null,
        ];

        // only touch the password when the client explicitly sent the field,
        // otherwise saving unrelated settings would silently clear it
        if (Arr::exists($params, 'password')) {
            $attributes['password'] = $params['password'] ?: null;
        }

        if ($fileRequest !== null) {
            $fileRequest->fill($attributes)->save();

            return $fileRequest;
        }

        $userId = Auth::id();
        $workspaceId = ActiveWorkspace::get()?->id;

        return FileRequest::create([
            ...$attributes,
            'user_id' => $userId,
            'workspace_id' => $workspaceId,
            'folder_id' => $this->resolveDestinationFolder(
                Arr::get($params, 'folder_id'),
                $params['title'],
                $userId,
                $workspaceId,
            )->id,
            'hash' => Str::random(30),
        ]);
    }

    /**
     * Use the folder the user picked, or build "File requests/{title}" for them.
     */
    protected function resolveDestinationFolder(
        int|null $folderId,
        string $title,
        int $userId,
        int|null $workspaceId,
    ): Folder {
        if ($folderId) {
            return Folder::query()->findOrFail($folderId);
        }

        $root = $this->findOrCreateFolder(
            self::ROOT_FOLDER_NAME,
            null,
            $userId,
            $workspaceId,
        );

        return $this->findOrCreateFolder(
            $this->uniqueChildName($title, $root->id, $userId, $workspaceId),
            $root->id,
            $userId,
            $workspaceId,
        );
    }

    protected function findOrCreateFolder(
        string $name,
        int|null $parentId,
        int $userId,
        int|null $workspaceId,
    ): Folder {
        $existing = $this->findFolder($name, $parentId, $userId, $workspaceId);

        if ($existing) {
            return $existing;
        }

        return (new CreateFolder())->execute([
            'name' => $name,
            'parent_id' => $parentId,
            'owner_id' => $userId,
            'workspace_id' => $workspaceId,
        ]);
    }

    protected function findFolder(
        string $name,
        int|null $parentId,
        int $userId,
        int|null $workspaceId,
    ): Folder|null {
        return Folder::query()
            ->where('name', $name)
            ->where('parent_id', $parentId)
            ->where('owner_id', $userId)
            ->when(
                $workspaceId,
                fn($query) => $query->where('workspace_id', $workspaceId),
            )
            ->first();
    }

    /**
     * Two requests with the same title should not collect into the same folder.
     */
    protected function uniqueChildName(
        string $title,
        int $parentId,
        int $userId,
        int|null $workspaceId,
    ): string {
        $name = $title;
        $suffix = 1;

        while ($this->findFolder($name, $parentId, $userId, $workspaceId)) {
            $suffix++;
            $name = "$title ($suffix)";
        }

        return $name;
    }
}
