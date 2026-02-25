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
        Schema::create('watch_specs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('product_id')->unique()->constrained('products')->onDelete('cascade');

            $table->string('movement_type')->nullable();
            $table->string('dial_color')->nullable();
            $table->string('strap_material')->nullable();
            $table->string('glass_material')->nullable();
            $table->string('water_resistance')->nullable();
            $table->string('case_size')->nullable();
            $table->string('warranty_period')->nullable();

            $table->timestamps();

            $table->index('movement_type');
            $table->index('strap_material');
            $table->index('case_size');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('watch_specs');
    }
};
