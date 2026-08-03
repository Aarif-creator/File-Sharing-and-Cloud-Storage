<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('starred_entries', function (Blueprint $table) {
            $table->id();
            $table->unsignedInteger('user_id')->index();
            $table->unsignedInteger('file_entry_id')->index();
            $table->timestamps();

            $table->unique(['user_id', 'file_entry_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('starred_entries');
    }
};
