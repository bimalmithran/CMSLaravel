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
        Schema::create('jewelry_specs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('product_id')->unique()->constrained('products')->onDelete('cascade');

            $table->string('huid', 6)->nullable()->unique();
            $table->string('metal_type')->nullable();
            $table->string('metal_color')->nullable();
            $table->string('purity')->nullable();
            $table->string('gender')->nullable();

            $table->decimal('gross_weight', 8, 3)->nullable();
            $table->decimal('net_weight', 8, 3)->nullable();
            $table->decimal('stone_weight', 8, 3)->nullable();

            $table->decimal('making_charge', 8, 2)->nullable();
            $table->enum('making_charge_type', ['flat', 'percent'])->default('percent');

            $table->timestamps();

            $table->index('metal_type');
            $table->index('purity');
            $table->index('gender');
            $table->index('net_weight');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('jewelry_specs');
    }
};
