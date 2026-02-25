<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('settings', function (Blueprint $table) {
            $table->id();
            $table->string('key')->unique(); // e.g., 'site_name', 'contact_email'
            $table->text('value')->nullable(); // Stores the actual data
            $table->string('type')->default('text'); // e.g., 'text', 'textarea', 'image', 'boolean'
            $table->string('group')->default('general'); // e.g., 'general', 'seo', 'social', 'contact'
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('settings');
    }
};

