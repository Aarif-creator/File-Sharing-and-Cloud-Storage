<?php

namespace App\Resources;

use App\Models\FileRequest;
use Dedoc\Scramble\Attributes\SchemaName;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin FileRequest
 */
#[SchemaName('FileRequest')]
class FileRequestResource extends JsonResource
{
    public function toArray($request)
    {
        return [
            'id' => $this->id,
            'hash' => $this->hash,
            'title' => $this->title,
            'description' => $this->description,
            'folder_id' => $this->folder_id,
            'has_password' => $this->password !== null,
            'deadline' => $this->deadline,
            'allow_late_uploads' => $this->allow_late_uploads,
            'closed_at' => $this->closed_at,
            'accepts_uploads' => $this->acceptsUploads(),
            'owner_name' => $this->whenLoaded(
                'user',
                fn() => $this->user?->name ?? __('Unknown'),
            ),
            'user_id' => $this->user_id,
            /** @var string $status open, closed or expired */
            'status' => $this->status(),
            'uploads_count' => $this->uploads_count,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
            'workspace_id' => $this->workspace_id,

            'folder' => $this->whenLoaded(
                'folder',
                fn() => [
                    'id' => $this->folder->id,
                    'name' => $this->folder->name,
                ],
            ),
        ];
    }
}
