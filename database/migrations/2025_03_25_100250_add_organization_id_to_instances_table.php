<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('instances', function (Blueprint $table) {
            // add organization_id to instances table after id
            $table->foreignId('organization_id')->after('id')->nullable()->constrained()->onDelete('set null');


        });
    }

    public function down(): void
    {
        Schema::table('instances', function (Blueprint $table) {
            //
            $table->dropForeign('organization_id');

        });
    }
};
