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
        Schema::table('submissions', function (Blueprint $table) {
            // Add columns for step data and optional flow association
            $table->unsignedBigInteger('flow_id')->nullable()->after('id');
            $table->string('step')->nullable()->after('flow_id');
            $table->json('data')->nullable()->after('step');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('submissions', function (Blueprint $table) {
            $table->dropColumn(['flow_id', 'step', 'data']);
        });
    }
};

