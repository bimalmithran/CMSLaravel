<?php

use App\Models\Menu;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('menus', function (Blueprint $table): void {
            $table->string('menu_type')->default(Menu::TYPE_DROPDOWN)->after('description');
            $table->foreignId('page_id')
                ->nullable()
                ->unique()
                ->after('menu_type')
                ->constrained('pages')
                ->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('menus', function (Blueprint $table): void {
            $table->dropForeign(['page_id']);
            $table->dropUnique('menus_page_id_unique');
            $table->dropColumn(['menu_type', 'page_id']);
        });
    }
};
