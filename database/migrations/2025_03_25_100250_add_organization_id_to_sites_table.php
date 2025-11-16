<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('sites', function (Blueprint $table) {
            // add organization_id to sites table after id
            $table->foreignId('organization_id')->after('id')->nullable()->constrained()->onDelete('set null');


        });
    }

    public function down(): void
    {
        Schema::table('sites', function (Blueprint $table) {
            //
            $table->dropForeign('organization_id');

        });
    }
};
