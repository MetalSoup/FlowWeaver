<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Site;
use App\Models\SiteDomain;

class MainDomainSeeder extends Seeder
{
    public function run(): void
    {
        // Prefer configured main domain; fall back to environment if necessary
        $main = config('app.main_domain');
        if (empty($main)) {
            $main = getenv('APP_MAIN_DOMAIN') ?: null;
        }
        if (!$main) return;

        $site = Site::firstOrCreate([
            'name' => 'Platform'
        ], [
            'description' => 'Platform site',
            'status' => 'active'
        ]);

        // create domain row if not exists
        SiteDomain::firstOrCreate([
            'domain' => $main
        ], [
            'site_id' => $site->id,
            'default_page_id' => null,
            'not_found_page_id' => null,
        ]);
    }
}
