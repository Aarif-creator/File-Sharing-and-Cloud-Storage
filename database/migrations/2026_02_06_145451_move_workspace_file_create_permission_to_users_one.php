<?php

use Common\Auth\Permissions\Permission;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        if (!Schema::hasColumn('permissions', 'type')) {
            return;
        }

        $workspacePermission = Permission::where('name', 'files.create')
            ->where('type', 'workspace')
            ->first();

        if (!$workspacePermission) {
            return;
        }

        $permission = Permission::where('name', 'files.create')
            ->where('type', 'users')
            ->first();
        if (!$permission) {
            return;
        }

        try {
            DB::table('permissionables')
                ->where('permission_id', $workspacePermission->id)
                ->update(['permission_id' => $permission->id]);
        } catch (Exception $e) {
            //
        }
    }
};
