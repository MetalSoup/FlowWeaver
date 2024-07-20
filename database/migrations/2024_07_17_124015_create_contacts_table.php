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
        Schema::create('contacts', function (Blueprint $table) {
            $table->id();
            $table->string('firstname')->nullable();
            $table->string('lastname')->nullable();
            $table->string('email')->nullable()->unique()->index();
            $table->string('phone')->nullable()->unique()->index();
            $table->string('street_address')->nullable();
            $table->string('street_address2')->nullable();
            $table->string('suburb')->nullable();
            $table->string('city')->nullable();
            $table->string('state')->nullable();
            $table->string('zip')->nullable();
            $table->string('country')->nullable();
            $table->string('gender')->nullable();
            $table->date('dob')->nullable();
            $table->json('custom_fields')->nullable();
            $table->string('status')->default('active');
            $table->string('source')->nullable();
            $table->foreignId('instance_id')->constrained();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('contacts');
    }
};
