<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Carbon;

class LargeUsersSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $total = 10000;
        $batchSize = 1000;
        $created = 0;

        while ($created < $total) {
            $count = min($batchSize, $total - $created);

            // Create models in-memory (this uses the factory's cached hashed password)
            $models = User::factory()->count($count)->make();

            // Use MySQL-friendly timestamp string
            $now = Carbon::now()->format('Y-m-d H:i:s');

            // Convert models to arrays and ensure timestamps are present for bulk insert
            $rows = $models->map(function ($m) use ($now) {
                // Prefer explicit attribute access (getAttribute/getRawOriginal/getAttributes)
                $name = $m->getAttribute('name') ?? ($m->toArray()['name'] ?? null);
                $email = $m->getAttribute('email') ?? ($m->toArray()['email'] ?? null);

                // Password extraction with fallbacks
                $pw = $m->getAttribute('password') ?? null;
                if (!$pw && method_exists($m, 'getRawOriginal')) {
                    $pw = $m->getRawOriginal('password') ?? $pw;
                }
                if (!$pw) {
                    $attrs = $m->getAttributes();
                    $pw = $attrs['password'] ?? $pw;
                }
                if (!$pw) {
                    $pw = Hash::make('password');
                }

                // email_verified_at -> normalize to datetime string or null
                $ev = $m->getAttribute('email_verified_at') ?? null;
                if ($ev instanceof \DateTimeInterface) {
                    $ev = $ev->format('Y-m-d H:i:s');
                } elseif ($ev !== null) {
                    try {
                        $ev = Carbon::parse($ev)->format('Y-m-d H:i:s');
                    } catch (\Exception $e) {
                        $ev = null;
                    }
                }

                // remember_token if present
                $remember = $m->getAttribute('remember_token') ?? null;

                // Build explicit row with required columns present
                return [
                    'name' => $name,
                    'email' => $email,
                    'email_verified_at' => $ev,
                    'password' => $pw,
                    'remember_token' => $remember,
                    'created_at' => $now,
                    'updated_at' => $now,
                ];
            })->toArray();

            // Bulk insert this batch
            DB::table('users')->insert($rows);

            $created += $count;
        }
    }
}
