<?php

namespace Common\Core\Policies;

use App\Models\User;
use App\Services\Tags\Tag;
use Common\Workspaces\Models\Workspace;
use Common\Workspaces\Policies\WorkspacedResourcePolicy;

class TagPolicy extends WorkspacedResourcePolicy
{
    protected string $resource = Tag::class;
}
