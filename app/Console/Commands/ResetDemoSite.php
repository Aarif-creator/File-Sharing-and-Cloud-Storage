<?php

namespace App\Console\Commands;

use App\Models\User;
use App\Services\Demo\HydrateUserWithSampleDriveContents;
use Common\Core\Install\UpdateActions;
use Illuminate\Support\Arr;
use Common\Files\Uploads\Uploads;
use Common\Permissions\Models\Permission;
use Common\Search\ImportRecordsIntoScout;
use Common\Settings\Settings;
use Common\Roles\Models\Role;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schema;
use Common\Auth\Actions\CreateUser;

class ResetDemoSite extends Command
{
    protected $signature = 'demo:reset';

    public function handle(): int
    {
        Artisan::call('optimize:clear');
        Artisan::call('down');

        $originalCacheDriver = config('cache.default');
        config()->set('cache.default', 'null');

        $this->recreateDatabase();
        $this->deleteAllUploadedFiles();

        app(Settings::class)->loadSettings();

        $this->createDemoAccounts();

        config()->set('cache.default', $originalCacheDriver);
        cache()->flush();

        Artisan::call('up');
        if (config('app.env') === 'production') {
            Artisan::call('optimize');
        }

        return Command::SUCCESS;
    }

    protected function recreateDatabase()
    {
        Schema::dropAllTables();

        (new UpdateActions())->execute();

        Artisan::call('migrate', ['--force' => true]);
    }

    protected function deleteAllUploadedFiles()
    {
        $types = Uploads::getAllTypes();

        foreach ($types as $type) {
            $backends = Uploads::getAllBackends($type);

            foreach ($backends as $backend) {
                $disk = Uploads::disk($type, $backend);

                foreach ($disk->allDirectories() as $directory) {
                    $disk->deleteDirectory($directory);
                }

                foreach ($disk->allFiles() as $file) {
                    $disk->delete($file);
                }
            }
        }
    }

    protected function createDemoAccounts(): array
    {
        $adminPermission = Permission::query()->where('name', 'admin')->first();
        $usersRole = Role::query()->where('default', true)->first();

        $demoUserData = User::factory()
            ->make([
                'name' => 'Demo User',
                'email' => 'user@user.com',
                'email_verified_at' => now(),
                'password' => 'password',
            ])
            ->getAttributes();

        $demoUser = (new CreateUser())->execute($demoUserData);

        $demoAdmin = (new CreateUser())->execute([
            'name' => 'Demo Admin',
            'email' => 'admin@admin.com',
            'password' => 'password',
            'email_verified_at' => now(),
            'permissions' => [$adminPermission],
            'roles' => [$usersRole->id],
        ]);

        (new HydrateUserWithSampleDriveContents(
            $demoUser,
            $demoAdmin,
        ))->execute();

        // super admin
        if (config('app.demo_email') && config('app.demo_password')) {
            $superAdmin = (new CreateUser())->execute([
                'email' => config('app.demo_email'),
                'password' => config('app.demo_password'),
                'email_verified_at' => now(),
                'permissions' => [$adminPermission],
                'roles' => [$usersRole->id],
            ]);
        }

        return [
            'demoUser' => $demoUser,
            'demoAdmin' => $demoAdmin,
            'superAdmin' => $superAdmin ?? null,
        ];
    }
}
