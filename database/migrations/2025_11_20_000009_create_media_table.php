<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Create a Spatie-compatible media table with site scoping
        Schema::create('media', function (Blueprint $table) {
            $table->bigIncrements('id');

            // polymorphic owner (Spatie)
            $table->string('model_type');
            $table->unsignedBigInteger('model_id');

            $table->uuid('uuid')->nullable();

            $table->string('collection_name');
            $table->string('name');
            $table->string('file_name');
            $table->string('mime_type')->nullable();

            $table->string('disk');
            $table->string('conversions_disk')->nullable();

            $table->unsignedBigInteger('size');

            $table->json('manipulations');
            $table->json('custom_properties');
            $table->json('generated_conversions');
            $table->json('responsive_images');

            // Ordering used by Spatie's IsSorted trait
            $table->unsignedInteger('order_column')->nullable();

            // Site scoping
            $table->unsignedBigInteger('site_id');

            $table->nullableTimestamps();

            // Indexes
            $table->index(['model_id', 'model_type'], 'media_model_id_model_type_index');
            $table->index('uuid');
            $table->index('collection_name');
            $table->index('site_id');

            // Foreign key to sites table with cascade delete
            $table->foreign('site_id')->references('id')->on('sites')->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::disableForeignKeyConstraints();
        Schema::dropIfExists('media');
        Schema::enableForeignKeyConstraints();
    }
};

