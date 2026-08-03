<?php

namespace App\Resources;

use App\Models\ShareableLink;
use Dedoc\Scramble\Attributes\SchemaName;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin ShareableLink
 */
#[SchemaName('ShareableLink')]
class ShareableLinkResource extends JsonResource
{
    public function toArray($request)
    {
        return [
            'id' => $this->id,
            'hash' => $this->hash,
            'expires_at' => $this->expires_at,
            'allow_download' => $this->allow_download,
            'allow_edit' => $this->allow_edit,
            'allow_direct' => $this->allow_direct,
            'has_password' => $this->password !== null,

            'entry' => $this->whenLoaded(
                'entry',
                fn() => new DriveEntryResource($this->entry),
            ),
        ];
    }
}
