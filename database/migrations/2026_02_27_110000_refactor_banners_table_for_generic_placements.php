<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('banners', function (Blueprint $table) {
            $table->renameColumn('description', 'subtitle');
            $table->renameColumn('image', 'image_path');
            $table->renameColumn('link', 'action_url');
            $table->renameColumn('order', 'sort_order');
        });

        Schema::table('banners', function (Blueprint $table) {
            $table->string('title')->nullable()->change();
            $table->string('subtitle')->nullable()->change();
            $table->string('placement')->default('homepage_hero')->after('image_path');
            $table->dropColumn('type');
            $table->index(['placement', 'is_active', 'sort_order'], 'banners_placement_active_sort_idx');
        });
    }

    public function down(): void
    {
        Schema::table('banners', function (Blueprint $table) {
            $table->dropIndex('banners_placement_active_sort_idx');
            $table->enum('type', ['homepage', 'product_page', 'category_page'])->default('homepage')->after('sort_order');
            $table->dropColumn('placement');
            $table->string('title')->nullable(false)->change();
            $table->text('subtitle')->nullable()->change();
        });

        Schema::table('banners', function (Blueprint $table) {
            $table->renameColumn('subtitle', 'description');
            $table->renameColumn('image_path', 'image');
            $table->renameColumn('action_url', 'link');
            $table->renameColumn('sort_order', 'order');
        });
    }
};

