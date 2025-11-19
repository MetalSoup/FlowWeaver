<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::table('pages', function (Blueprint $table) {
            // create a unique index on (site_id, slug) to enforce uniqueness at DB level
            $table->unique(['site_id', 'slug'], 'pages_site_slug_unique');
        });
    }

    public function down()
    {
        Schema::table('pages', function (Blueprint $table) {
            $table->dropUnique('pages_site_slug_unique');
        });
    }
};

