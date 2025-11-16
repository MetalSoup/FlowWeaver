<?php

namespace Database\Seeders;

use App\Models\Site;
use App\Models\Organization;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class SiteSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // For each organization create between 2 and 5 sites
        Organization::chunk(100, function ($organizations) {
            foreach ($organizations as $organization) {
                $count = rand(2, 5);

                Site::factory()
                    ->count($count)
                    ->create([
                        'organization_id' => $organization->id,
                    ]);
            }
        });
    }
}
