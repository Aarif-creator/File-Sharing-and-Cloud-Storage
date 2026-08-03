<?php

namespace App\QueryBuilders;

use App\Models\FileRequest;
use Common\Database\QueryBuilder\BaseQueryBuilder;
use Common\Database\QueryBuilder\Filter;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;

class FileRequestsQueryBuilder extends BaseQueryBuilder
{
    protected string $model = FileRequest::class;

    protected function shouldScopeToWorkspace(): bool
    {
        return true;
    }

    protected function getBaseBuilder(): Builder
    {
        return FileRequest::query()
            ->where('user_id', Auth::id())
            ->with('folder.users');
    }

    protected function filterableFields(): array
    {
        return ['created_at', 'updated_at', 'deadline', 'closed_at'];
    }

    protected function sortableFields(): array
    {
        return [
            'id',
            'title',
            'created_at',
            'updated_at',
            'deadline',
            'closed_at',
            'uploads_count',
        ];
    }

    protected function getPerPage(): int
    {
        $perPage = (int) Arr::get($this->params, 'per_page', 50);
        return max(1, min(100, $perPage));
    }

    protected function applySearchQuery(): void
    {
        $search = Str::of(Arr::get($this->params, 'query', ''))
            ->trim()
            ->value();

        if ($search) {
            $this->builder->where(function (Builder $query) use ($search) {
                $query->where('title', 'like', "%{$search}");
            });
        }
    }

    protected function applyFilter(Filter $filter): Builder
    {
        return match ($filter->key) {
            'created_at', 'updated_at' => $this->simpleFilter($filter),
        };
    }
}
