<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('content_blocks', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('identifier')->unique();
            $table->string('type');
            $table->longText('content')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->index(['identifier', 'is_active'], 'content_blocks_identifier_active_idx');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('content_blocks');
    }
};

