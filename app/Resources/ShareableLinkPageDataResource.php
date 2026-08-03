<?php

namespace App\Resources;

use App\Models\ShareableLink;
use Dedoc\Scramble\Attributes\SchemaName;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin ShareableLink
 */
#[SchemaName('ShareableLinkPageData')]
class ShareableLinkPageDataResource extends JsonResource
{
    public function toArray($request)
    {
        return parent::toArray($request);
    }
}
