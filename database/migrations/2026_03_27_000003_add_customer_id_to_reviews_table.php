<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('reviews', function (Blueprint $table) {
            // Drop the existing non-nullable FK so we can make it nullable
            $table->dropForeign(['user_id']);
            $table->unsignedBigInteger('user_id')->nullable()->change();

            // Add customer_id FK (nullable – reviews require a logged-in customer)
            $table->foreignId('customer_id')
                  ->nullable()
                  ->after('user_id')
                  ->constrained('customers')
                  ->onDelete('set null');
        });
    }

    public function down(): void
    {
        Schema::table('reviews', function (Blueprint $table) {
            $table->dropForeign(['customer_id']);
            $table->dropColumn('customer_id');

            // Restore non-nullable user_id FK
            $table->unsignedBigInteger('user_id')->nullable(false)->change();
            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
        });
    }
};
