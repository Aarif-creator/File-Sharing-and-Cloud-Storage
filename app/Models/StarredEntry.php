<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class StarredEntry extends Model
{
    protected $guarded = [];

    public function fileEntry(): BelongsTo
    {
        return $this->belongsTo(FileEntry::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
