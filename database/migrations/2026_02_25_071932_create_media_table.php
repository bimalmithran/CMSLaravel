<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('media', function (Blueprint $table) {
            $table->id();
            $table->string('disk')->default('public'); // public, s3, etc.
            $table->string('file_name');               // original_name.jpg
            $table->string('path');                    // uploads/2026/02/unique_name.jpg
            $table->string('mime_type');               // image/jpeg
            $table->unsignedBigInteger('size');        // In bytes
            $table->string('alt_text')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('media');
    }
};
