<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('file_requests', function (Blueprint $table) {
            $table->increments('id');
            $table->string('hash', 30)->unique();
            $table->integer('user_id')->unsigned()->index();
            $table->integer('workspace_id')->unsigned()->default(0)->index();
            $table->integer('folder_id')->unsigned()->index();
            $table->string('title');
            $table->text('description')->nullable();
            $table->string('password')->nullable();
            $table->timestamp('deadline')->nullable();
            $table->boolean('allow_late_uploads')->default(false);
            $table->timestamp('closed_at')->nullable();
            $table->unsignedInteger('uploads_count')->default(0);
            $table->timestamps();

            $table->collation = config('database.connections.mysql.collation');
            $table->charset = config('database.connections.mysql.charset');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('file_requests');
    }
};
