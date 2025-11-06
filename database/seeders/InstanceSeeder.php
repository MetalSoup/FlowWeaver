<?php

namespace Database\Seeders;

use App\Models\Instance;
use App\Models\Organization;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class InstanceSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // For each organization create between 2 and 5 instances
        Organization::chunk(100, function ($organizations) {
            foreach ($organizations as $organization) {
                $count = rand(2, 5);

                Instance::factory()
                    ->count($count)
                    ->create([
                        'organization_id' => $organization->id,
                    ]);
            }
        });
    }
}
