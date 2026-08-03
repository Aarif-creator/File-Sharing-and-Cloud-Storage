<?php

namespace App\Resources;

use App\Services\Entries\GetEntryPermissions;
use Common\Files\FileEntry;
use Dedoc\Scramble\Attributes\SchemaName;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin FileEntry
 */
#[SchemaName('DriveEntry')]
class DriveEntryResource extends JsonResource
{
    public function toArray($request)
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'file_name' => $this->file_name,
            'mime' => $this->mime,
            'url' => $this->url,
            'hash' => $this->hash,
            'extension' => $this->extension,
            'parent_id' => $this->parent_id,
            'workspace_id' => $this->workspace_id,
            'type' => $this->type,
            'public' => $this->public,
            'file_size' => $this->file_size,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
            'thumbnail' => $this->thumbnail,
            'path' => $this->path,
            'starred' => $this->whenLoaded(
                'starredEntries',
                fn() => $this->starredEntries->isNotEmpty() ? true : false,
            ),

            'tags' => $this->whenLoaded(
                'tags',
                fn() => TagResource::collection($this->tags),
            ),

            /** @var array{
             *  'files.view': bool,
             *  'files.update': bool,
             *  'files.create': bool,
             *  'files.download': bool,
             *  'files.delete': bool,
             * } */
            'permissions' => app(GetEntryPermissions::class)->execute(
                $this->resource,
            ),

            'users' => $this->whenLoaded(
                'users',
                fn() => $this->users->map(
                    fn($user) => [
                        'id' => $user->id,
                        'email' => $user->email,
                        'name' => $user->name,
                        'image' => $user->image,
                        'owns_entry' => (bool) $user->pivot->owner,
                        /** @var array{
                         *  'edit': bool,
                         *  'view': bool,
                         *  'download': bool,
                         * } */
                        'entry_permissions' => $user->entry_permissions,
                    ],
                ),
            ),
        ];
    }
}
