<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasTable('media')) {
            return;
        }

        $row = DB::selectOne("SELECT COUNT(*) as cnt FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'media' AND column_name = 'site_id'");
        if (! $row || ($row->cnt ?? 0) == 0) {
            // If column doesn't exist, create it nullable
            DB::statement('ALTER TABLE `media` ADD COLUMN `site_id` BIGINT UNSIGNED NULL');
            DB::statement('ALTER TABLE `media` ADD INDEX `media_site_id_index` (`site_id`)');
            return;
        }

        // If column exists, modify to allow NULL
        try {
            DB::statement('ALTER TABLE `media` MODIFY `site_id` BIGINT UNSIGNED NULL');
        } catch (\Throwable $_) {
            try {
                Schema::table('media', function (\Illuminate\Database\Schema\Blueprint $table) {
                    $table->unsignedBigInteger('site_id')->nullable()->change();
                });
            } catch (\Throwable $_) {
                // ignore failures
            }
        }
    }

    public function down(): void
    {
        // No-op
    }
};

