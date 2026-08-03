<?php

namespace App\Services\Demo;

use App\Models\Folder;
use App\Models\User;
use App\Services\Entries\CreateFolder;
use App\Services\Shares\AttachUsersToEntry;
use Common\Files\Actions\CreateFileEntry;
use Common\Files\Actions\StoreFile;
use Common\Files\FileEntryPayload;
use Common\Files\Uploads\Uploads;
use Common\Workspaces\Models\Workspace;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\File;

class HydrateUserWithSampleDriveContents
{
    protected int $workspaceId;

    public function __construct(protected User $user, protected User $shareUser)
    {
        $this->workspaceId = Workspace::query()
            ->where('owner_id', $this->user->id)
            ->first()->id;
    }

    public function execute(): void
    {
        if (!config('app.demo')) {
            return;
        }

        $this->hydrateFolder('root');

        $images = $this->hydrateFolder('images');
        $this->hydrateFolder('nested folder', $images->id);

        $this->hydrateFolder('documents');

        $folder = $this->hydrateFolder('shared');
        app(AttachUsersToEntry::class)->execute(
            [$this->shareUser->email],
            [$folder],
            ['view' => true],
        );
    }

    private function hydrateFolder($name, $parentId = null): ?Folder
    {
        if ($name !== 'root') {
            $folder = (new CreateFolder())->execute([
                'name' => ucwords($name),
                'owner_id' => $this->user->id,
                'parent_id' => $parentId,
                'workspace_id' => $this->workspaceId,
            ]);
        }

        $this->createFiles($name, isset($folder) ? $folder->id : null);

        return $folder ?? null;
    }

    private function createFiles($dirName, $parentId): void
    {
        $folderPath = base_path("sample-files/$dirName");

        if (!File::exists($folderPath)) {
            return;
        }

        $uploadType = Uploads::type('bedrive');

        foreach (File::files($folderPath) as $path) {
            $uploadedFile = new UploadedFile(
                $path,
                basename($path),
                File::mimeType($path),
                File::size($path),
            );

            $payload = new FileEntryPayload([
                'file' => $uploadedFile,
                'parentId' => $parentId,
                'ownerId' => $this->user->id,
                'uploadType' => 'bedrive',
                'backendId' => $uploadType->backendIds[0],
                'workspaceId' => $this->workspaceId,
            ]);

            (new StoreFile())->execute($payload, ['file' => $uploadedFile]);
            (new CreateFileEntry())->execute($payload);
        }
    }
}
