<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;
use App\Models\User;

class RoleSeeder extends Seeder
{
    public function run(): void
    {
        // Create a super-admin role if it doesn't exist
        $role = Role::firstOrCreate(['name' => 'super-admin']);

        // Optionally assign it to the first user (test@example.com) if present
        $user = User::where('email', 'test@example.com')->first();
        if ($user && !$user->hasRole('super-admin')) {
            $user->assignRole('super-admin');
        }
    }
}

