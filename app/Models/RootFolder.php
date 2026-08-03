<?php

namespace App\Models;

use Illuminate\Support\Facades\Auth;
use Common\Workspaces\ActiveWorkspace;

class RootFolder extends FileEntry
{
    protected $id = 0;
    protected $appends = ['name'];
    protected $casts = [];
    protected $relations = ['users'];

    protected $attributes = [
        'type' => 'folder',
        'id' => 0,
        'hash' => '0',
        'path' => '',
    ];

    public function __construct(array $attributes = [])
    {
        parent::__construct($attributes);

        $this->setCurrentUserAsOwner();
        $this->workspace_id = ActiveWorkspace::get()->id;
    }

    public function getNameAttribute(): string
    {
        return trans('All Files');
    }

    public function getHashAttribute(): string
    {
        return '0';
    }

    private function setCurrentUserAsOwner(): void
    {
        $users = collect([]);
        if (Auth::check() && ActiveWorkspace::get()->isOwner(Auth::user())) {
            $user = Auth::user();
            $user->pivot = (object) ['owner' => true];
            $users[] = $user;
        }
        $this->setRelation('users', $users);
    }
}
