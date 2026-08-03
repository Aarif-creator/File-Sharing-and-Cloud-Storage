<?php

use Common\Permissions\Config\PermissionConfigLoader;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration {
    public function up(): void
    {
        $workspaceRoles = DB::table('roles')->where('type', 'workspace')->get();
        $permissions = DB::table('permissions')->get();
        $viewFilesPermission = $permissions->first(
            fn($p) => $p->name === 'files.view',
        );

        if (!$viewFilesPermission) {
            $allPermissions = (new PermissionConfigLoader())->get();
            $viewFilesPermission = collect($allPermissions)->first(
                fn($p) => $p->name === 'files.view',
            );
            DB::table('permissions')->insert([
                'name' => $viewFilesPermission->name,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
            $viewFilesPermission = DB::table('permissions')
                ->where('name', $viewFilesPermission->name)
                ->first();
        }

        foreach ($workspaceRoles as $workspaceRole) {
            $currentPermissions = DB::table('permissionables')
                ->where('permissionable_id', $workspaceRole->id)
                ->where('permissionable_type', 'role')
                ->pluck('permission_id')
                ->toArray();

            if (!in_array($viewFilesPermission->id, $currentPermissions)) {
                DB::table('permissionables')->insert([
                    'permission_id' => $viewFilesPermission->id,
                    'permissionable_id' => $workspaceRole->id,
                    'permissionable_type' => 'role',
                ]);
            }
        }
    }
};
