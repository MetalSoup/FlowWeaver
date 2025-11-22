<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('site_domains', function (Blueprint $table) {
            $table->id();
            $table->foreignId('site_id')->constrained('sites')->cascadeOnDelete();
            $table->string('domain')->unique();
            $table->foreignId('default_page_id')->nullable()->constrained('pages')->nullOnDelete();
            $table->foreignId('not_found_page_id')->nullable()->constrained('pages')->nullOnDelete();
            $table->timestamps();
        });

        Schema::table('site_domains', function (Blueprint $table) {
            $table->index('site_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('site_domains');
    }
};

