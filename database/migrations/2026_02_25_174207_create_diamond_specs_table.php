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
        Schema::create('diamond_specs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('product_id')->unique()->constrained('products')->onDelete('cascade');

            $table->string('diamond_clarity')->nullable();
            $table->string('diamond_color')->nullable();
            $table->string('diamond_cut')->nullable();
            $table->string('diamond_setting')->nullable();
            $table->integer('diamond_count')->nullable();

            $table->timestamps();

            $table->index('diamond_clarity');
            $table->index('diamond_color');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('diamond_specs');
    }
};
