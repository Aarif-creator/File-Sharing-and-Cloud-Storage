<?php

namespace App\Providers;

use App\Listeners\DeleteStarredEntries;
use App\Listeners\FolderTotalSizeSubscriber;
use Common\Auth\Events\UsersDeleted;
use Common\Files\Events\FileEntriesDeleted;
use Illuminate\Auth\Events\Login;
use Illuminate\Auth\Events\Registered;
use Common\Auth\Events\UserCreated;
use App\Listeners\HandleDeletedWorkspace;
use Common\Notifications\SubscribeUserToNotifications;
use Common\Workspaces\Events\WorkspaceDeleted;
use Common\Workspaces\Listeners\AttachWorkspaceToUser;
use App\Models\File;
use App\Models\FileEntry;
use App\Models\FileRequest;
use App\Models\User;
use App\Services\Admin\GetAnalyticsHeaderData;
use App\Services\AppBootstrapData;
use App\Services\Entries\GetEntryPermissions;
use Common\Admin\Analytics\Actions\GetAnalyticsHeaderDataAction;
use Common\Core\Bootstrap\BootstrapData;
use Common\Files\FileEntry as CommonFileEntry;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\Relation;
use Illuminate\Support\ServiceProvider;
use App\Models\Folder;
use App\Models\ShareableLink;
use App\Policies\DriveFileEntryPolicy;
use App\Policies\FileRequestPolicy;
use App\Policies\ShareableLinkPolicy;
use App\Services\Tags\Tag;
use Common\API\PublicApiDocsFilter;
use Common\Core\Policies\TagPolicy;
use Dedoc\Scramble\Scramble;
use Dedoc\Scramble\Support\Generator\OpenApi;
use Dedoc\Scramble\Support\Generator\SecurityScheme;
use Illuminate\Routing\Route;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Str;

const WORKSPACED_RESOURCES = [FileEntry::class];
const WORKSPACE_HOME_ROUTE = '/drive';

class AppServiceProvider extends ServiceProvider
{
    public function boot()
    {
        Model::preventLazyLoading(!app()->isProduction());

        Relation::enforceMorphMap([
            FileEntry::MODEL_TYPE => FileEntry::class,
            User::MODEL_TYPE => User::class,
        ]);

        Gate::policy(CommonFileEntry::class, DriveFileEntryPolicy::class);
        Gate::policy(File::class, DriveFileEntryPolicy::class);
        Gate::policy(Folder::class, DriveFileEntryPolicy::class);
        Gate::policy(ShareableLink::class, ShareableLinkPolicy::class);
        Gate::policy(FileRequest::class, FileRequestPolicy::class);
        Gate::policy(Tag::class, TagPolicy::class);

        Scramble::throwOnError(true);

        Scramble::configure()->withDocumentTransformers(function (
            OpenApi $openApi,
        ) {
            $openApi->secure(SecurityScheme::http('bearer'));
        });

        Scramble::registerApi('internal')->expose(
            ui: '/docs/api-internal',
            document: '/docs/api-internal.json',
        );

        Scramble::registerApi('public')
            ->routes(
                fn(Route $route) => Str::startsWith(
                    $route->uri,
                    config('scramble.api_path', 'api/v1'),
                ) && !PublicApiDocsFilter::shouldExcludeRoute($route),
            )
            ->withDocumentTransformers(function (OpenApi $document) {
                PublicApiDocsFilter::removeExcludedOperations(
                    $document,
                    excludedTags: [
                        'Admin',
                        'Comments',
                        'Followers',
                        'Reports',
                        'Votes',
                        'PasswordResetLink', // laravel fortify
                    ],
                );
            });
    }

    public function register()
    {
        Scramble::ignoreDefaultRoutes();

        $this->app->bind(
            GetAnalyticsHeaderDataAction::class,
            GetAnalyticsHeaderData::class,
        );

        $this->app->bind(BootstrapData::class, AppBootstrapData::class);

        $this->app->bind(CommonFileEntry::class, FileEntry::class);

        $this->app->singleton(
            GetEntryPermissions::class,
            fn() => new GetEntryPermissions(),
        );

        Event::listen(Login::class, AttachWorkspaceToUser::class);
        Event::listen(Registered::class, AttachWorkspaceToUser::class);
        Event::listen(WorkspaceDeleted::class, HandleDeletedWorkspace::class);
        Event::listen(FileEntriesDeleted::class, DeleteStarredEntries::class);
        Event::listen(UsersDeleted::class, DeleteStarredEntries::class);

        Event::listen(UserCreated::class, function (UserCreated $event) {
            app(SubscribeUserToNotifications::class)->execute(
                $event->user,
                null,
            );
        });

        Event::subscribe(FolderTotalSizeSubscriber::class);
    }
}
