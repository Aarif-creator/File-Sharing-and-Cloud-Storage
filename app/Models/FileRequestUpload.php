<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class FileRequestUpload extends Model
{
    const UPDATED_AT = null;

    protected $guarded = [];

    protected $casts = [
        'id' => 'integer',
        'file_request_id' => 'integer',
        'entry_id' => 'integer',
    ];

    public function fileRequest(): BelongsTo
    {
        return $this->belongsTo(FileRequest::class);
    }

    public function entry(): BelongsTo
    {
        return $this->belongsTo(FileEntry::class, 'entry_id');
    }
}
