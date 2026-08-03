<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('file_request_uploads', function (Blueprint $table) {
            $table->increments('id');
            $table->integer('file_request_id')->unsigned()->index();
            $table->integer('entry_id')->unsigned()->index();
            $table->string('uploader_name');
            $table->string('uploader_email')->nullable();
            $table->timestamp('created_at')->nullable();

            $table->collation = config('database.connections.mysql.collation');
            $table->charset = config('database.connections.mysql.charset');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('file_request_uploads');
    }
};
