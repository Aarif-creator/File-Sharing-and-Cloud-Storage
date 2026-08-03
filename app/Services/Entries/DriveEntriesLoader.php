<?php

namespace App\Services\Entries;

use App\Models\FileEntry;
use App\Models\RootFolder;
use App\Models\User;
use Common\Database\QueryBuilder\BaseQueryBuilder;
use Common\Database\QueryBuilder\Filter;
use Common\Workspaces\ActiveWorkspace;
use Exception;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class DriveEntriesLoader extends BaseQueryBuilder
{
    protected string $model = FileEntry::class;

    protected GetEntryPermissions $setPermissionsOnEntry;
    protected User $user;

    protected $scopeToWorkspace = true;

    public function __construct(protected array $params)
    {
        $this->setPermissionsOnEntry = app(GetEntryPermissions::class);
        $this->user = Auth::user();

        if (!ActiveWorkspace::get()) {
            throw new Exception('Active workspace not found');
        }

        parent::__construct($params);
    }

    protected function getBaseBuilder(): Builder
    {
        $builder = FileEntry::query()
            ->where('public', false)
            // folders should always be first
            ->orderBy(DB::raw('type = "folder"'), 'desc')
            ->with([
                'users',
                'tags',
                'starredEntries' => fn($query) => $query->where(
                    'starred_entries.user_id',
                    $this->user->id,
                ),
            ]);

        // load entries with ids matching [entryIds], but only if their parent id is not in [entryIds]
        if ($entryIds = Arr::get($this->params, 'entryIds')) {
            $entryIds = explode(',', $entryIds);
            $builder
                ->whereIn('file_entries.id', $entryIds)
                ->whereDoesntHave('parent', function ($query) use ($entryIds) {
                    $query->whereIn('file_entries.id', $entryIds);
                });
        }

        return $builder;
    }

    protected function getPerPage(): int
    {
        $perPage = (int) Arr::get($this->params, 'per_page', 50);
        return max(1, min(50, $perPage));
    }

    public function load(): DriveEntriesLoadResult
    {
        switch ($this->params['section']) {
            case 'folder':
                return $this->folder();
            case 'recent':
                return $this->recent();
            case 'trash':
                return $this->trash();
            case 'starred':
                return $this->starred();
            case 'sharedByMe':
                return $this->sharedByMe();
            case 'sharedWithMe':
                return $this->sharedWithMe();
            case 'search':
                return $this->search();
            case 'offline':
                return $this->offline();
            case 'allChildren':
                return $this->allChildren();
            default:
                return $this->home();
        }
    }

    protected function home(): DriveEntriesLoadResult
    {
        $this->builder->whereNull('parent_id');

        return new DriveEntriesLoadResult(
            entries: $this->paginate(),
            folder: new RootFolder(),
        );
    }

    protected function folder(): DriveEntriesLoadResult
    {
        if ($this->params['folder_id'] == 0) {
            return $this->home();
        } elseif ($this->params['folder_id'] == 'sharedWithMe') {
            return $this->sharedWithMe();
        }

        $folder = FileEntry::with('users')
            ->byIdOrHash($this->params['folder_id'])
            ->firstOrFail();
        $this->builder->where('parent_id', $folder->id);

        return new DriveEntriesLoadResult(
            entries: $this->paginate(),
            folder: $folder,
        );
    }

    protected function search(): DriveEntriesLoadResult
    {
        return new DriveEntriesLoadResult(entries: $this->paginate());
    }

    protected function recent(): DriveEntriesLoadResult
    {
        // only show files in recent section
        $this->builder->where('type', '!=', 'folder');

        $this->params['sort'] = 'created_at:desc';

        return new DriveEntriesLoadResult(entries: $this->paginate());
    }

    protected function trash(): DriveEntriesLoadResult
    {
        $this->builder->onlyTrashed()->whereRootOrParentNotTrashed();

        return new DriveEntriesLoadResult(entries: $this->paginate());
    }

    protected function starred(): DriveEntriesLoadResult
    {
        $this->builder->onlyStarred($this->user->id);

        return new DriveEntriesLoadResult(entries: $this->paginate());
    }

    protected function sharedByMe(): DriveEntriesLoadResult
    {
        $this->builder->sharedByUser($this->user->id);

        return new DriveEntriesLoadResult(entries: $this->paginate());
    }

    protected function sharedWithMe(): DriveEntriesLoadResult
    {
        $this->scopeToWorkspace = false;

        $this->builder->sharedWithUserOnly($this->user->id);

        return new DriveEntriesLoadResult(entries: $this->paginate());
    }

    protected function offline(): DriveEntriesLoadResult
    {
        $this->scopeToWorkspace = false;

        return new DriveEntriesLoadResult(entries: $this->paginate());
    }

    protected function allChildren(): DriveEntriesLoadResult
    {
        $folderId = Arr::get($this->params, 'folder_id');
        $folder = FileEntry::byIdOrHash($folderId)->firstOrFail();

        $this->builder->where(
            'path',
            'like',
            $folder->getRawOriginal('path') . '/%',
        );

        $this->params['per_page'] = 500;
        return new DriveEntriesLoadResult(entries: $this->paginate());
    }

    protected function transformSort(array $sort): array
    {
        // order by id in case updated_at date is the same
        return [...$sort, 'id' => 'desc'];
    }

    protected function shouldScopeToWorkspace()
    {
        return $this->scopeToWorkspace;
    }

    protected function applyFilter(Filter $filter): Builder
    {
        return match ($filter->key) {
            'type' => $this->builder->where('type', $filter->value),
            'owner' => $this->builder->when(
                $filter->value === 'me',
                fn($query) => $query->where('owner_id', $this->user->id),
                fn($query) => $query->where('owner_id', '!=', $this->user->id),
            ),
            'created_at' => $this->simpleFilter($filter),
            'updated_at' => $this->simpleFilter($filter),
            'location' => $this->builder
                ->when(
                    $filter->value === 'trashed',
                    fn($query) => $query
                        ->onlyTrashed()
                        ->whereRootOrParentNotTrashed(),
                )
                ->when(
                    $filter->value === 'starred',
                    fn($query) => $query->onlyStarred($this->user->id),
                )
                ->when(is_numeric($filter->value), function () use ($filter) {
                    $folder = FileEntry::byIdOrHash($filter->value)->first();
                    if ($folder) {
                        $this->builder->where(
                            'path',
                            'like',
                            $folder->getRawOriginal('path') . '/%',
                        );
                    }
                }),
            'sharing' => $this->builder
                ->when($filter->value === 'shared_with_me', function () {
                    $this->scopeToWorkspace = false;
                    $this->builder->sharedWithUserOnly($this->user->id);
                })
                ->when(
                    $filter->value === 'shared_by_me',
                    fn($query) => $query->sharedByUser($this->user->id),
                )
                ->when(
                    $filter->value === 'has_shareable_link',
                    fn($query) => $query->whereHas('shareableLink'),
                ),
        };
    }

    protected function filterableFields(): array
    {
        return [
            'type',
            'owner',
            'created_at',
            'updated_at',
            'location',
            'sharing',
        ];
    }
}
