<?php

namespace App\Models;

use Carbon\Carbon;
use Common\Workspaces\Traits\BelongsToWorkspace;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class FileRequest extends Model
{
    use BelongsToWorkspace;

    protected $guarded = [];

    protected $casts = [
        'id' => 'integer',
        'user_id' => 'integer',
        'workspace_id' => 'integer',
        'folder_id' => 'integer',
        'uploads_count' => 'integer',
        'allow_late_uploads' => 'boolean',
        'deadline' => 'datetime',
        'closed_at' => 'datetime',
    ];

    public function folder(): BelongsTo
    {
        return $this->belongsTo(Folder::class, 'folder_id');
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function uploads(): HasMany
    {
        return $this->hasMany(FileRequestUpload::class);
    }

    public function setPasswordAttribute(?string $value)
    {
        $this->attributes['password'] = $value ? bcrypt($value) : null;
    }

    public function isOpen(): bool
    {
        return $this->closed_at === null;
    }

    public function isPastDeadline(): bool
    {
        return $this->deadline !== null &&
            $this->deadline->isBefore(Carbon::now());
    }

    /**
     * Whether new files can currently be uploaded into this request.
     */
    public function acceptsUploads(): bool
    {
        if (!$this->isOpen()) {
            return false;
        }

        if ($this->isPastDeadline() && !$this->allow_late_uploads) {
            return false;
        }

        return true;
    }

    public function status(): string
    {
        if (!$this->isOpen()) {
            return 'closed';
        }

        if ($this->isPastDeadline() && !$this->allow_late_uploads) {
            return 'expired';
        }

        return 'open';
    }
}
