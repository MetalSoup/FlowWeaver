<?php

namespace Database\Seeders;

use App\Models\User;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // User::factory(10)->create();

        User::factory()->create([
            'name' => 'Test User',
            'email' => 'test@example.com',
        ]);

        // To seed 10,000 users quickly, run:
        // php artisan db:seed --class=Database\Seeders\LargeUsersSeeder
        // or register LargeUsersSeeder here by uncommenting the line below:
        // $this->call(LargeUsersSeeder::class);
    }
}
