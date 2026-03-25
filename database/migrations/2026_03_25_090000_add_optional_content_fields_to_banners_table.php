<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasColumn('banners', 'description')) {
            Schema::table('banners', function (Blueprint $table) {
                $table->text('description')->nullable()->after('subtitle');
            });
        }

        if (!Schema::hasColumn('banners', 'price_text')) {
            Schema::table('banners', function (Blueprint $table) {
                $table->string('price_text')->nullable()->after('description');
            });
        }

        if (!Schema::hasColumn('banners', 'button_text')) {
            Schema::table('banners', function (Blueprint $table) {
                $table->string('button_text')->nullable()->after('action_url');
            });
        }
    }

    public function down(): void
    {
        if (Schema::hasColumn('banners', 'button_text')) {
            Schema::table('banners', function (Blueprint $table) {
                $table->dropColumn('button_text');
            });
        }

        if (Schema::hasColumn('banners', 'price_text')) {
            Schema::table('banners', function (Blueprint $table) {
                $table->dropColumn('price_text');
            });
        }

        if (Schema::hasColumn('banners', 'description')) {
            Schema::table('banners', function (Blueprint $table) {
                $table->dropColumn('description');
            });
        }
    }
};
