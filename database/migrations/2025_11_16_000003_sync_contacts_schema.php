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
        Schema::table('contacts', function (Blueprint $table) {
            // Rename columns to match DefaultFields
            if (Schema::hasColumn('contacts', 'firstname')) {
                $table->renameColumn('firstname', 'first_name');
            }
            if (Schema::hasColumn('contacts', 'lastname')) {
                $table->renameColumn('lastname', 'last_name');
            }
            if (Schema::hasColumn('contacts', 'street_address')) {
                $table->renameColumn('street_address', 'address');
            }
            if (Schema::hasColumn('contacts', 'street_address2')) {
                $table->renameColumn('street_address2', 'street');
            }

            // Add columns that may be missing
            if (!Schema::hasColumn('contacts', 'company')) {
                $table->string('company')->nullable()->after('country');
            }
            if (!Schema::hasColumn('contacts', 'title')) {
                $table->string('title')->nullable()->after('company');
            }
            if (!Schema::hasColumn('contacts', 'website')) {
                $table->string('website')->nullable()->after('title');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('contacts', function (Blueprint $table) {
            if (Schema::hasColumn('contacts', 'first_name')) {
                $table->renameColumn('first_name', 'firstname');
            }
            if (Schema::hasColumn('contacts', 'last_name')) {
                $table->renameColumn('last_name', 'lastname');
            }
            if (Schema::hasColumn('contacts', 'address')) {
                $table->renameColumn('address', 'street_address');
            }
            if (Schema::hasColumn('contacts', 'street')) {
                $table->renameColumn('street', 'street_address2');
            }

            if (Schema::hasColumn('contacts', 'website')) {
                $table->dropColumn('website');
            }
            if (Schema::hasColumn('contacts', 'title')) {
                $table->dropColumn('title');
            }
            if (Schema::hasColumn('contacts', 'company')) {
                $table->dropColumn('company');
            }
        });
    }
};

