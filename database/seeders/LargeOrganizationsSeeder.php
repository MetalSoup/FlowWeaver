<?php

namespace Database\Seeders;

use App\Models\Organization;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Carbon;

class LargeOrganizationsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $totalOrgs = 12000;
        $orgBatch = 1000;

        // load all user ids to attach to organizations
        $userIds = User::pluck('id')->toArray();
        if (empty($userIds)) {
            $this->command->warn('No users found. Create users before running this seeder.');
            return;
        }

        $created = 0;
        $now = Carbon::now()->format('Y-m-d H:i:s');

        while ($created < $totalOrgs) {
            $count = min($orgBatch, $totalOrgs - $created);

            // create orgs using factory->make and bulk insert for speed
            $models = Organization::factory()->count($count)->make();

            $rows = $models->map(function ($m) use ($now) {
                return [
                    'name' => $m->getAttribute('name') ?? $m->toArray()['name'] ?? null,
                    'created_at' => $now,
                    'updated_at' => $now,
                ];
            })->toArray();

            // get current max id to compute the range of inserted ids
            $maxId = DB::table('organizations')->max('id') ?? 0;

            // insert the batch
            DB::table('organizations')->insert($rows);

            // Determine the ids of inserted orgs reliably
            $firstId = $maxId + 1;
            $insertedIds = range($firstId, $firstId + $count - 1);

            // Build pivot rows to attach 1-5 users to each org
            $pivotRows = [];
            foreach ($insertedIds as $orgId) {
                $attachCount = rand(1, 5);
                // pick unique user ids for this org
                if ($attachCount >= count($userIds)) {
                    $selected = $userIds;
                } else {
                    $selected = (array) array_rand(array_flip($userIds), $attachCount);
                }
                foreach ($selected as $uid) {
                    $pivotRows[] = [
                        'organization_id' => $orgId,
                        'user_id' => $uid,
                    ];
                }
            }

            // Insert pivot rows in bulk
            if (!empty($pivotRows)) {
                DB::table('organization_user')->insert($pivotRows);
            }

            $created += $count;
            $this->command->info("Inserted {$created}/{$totalOrgs} organizations");
        }

        $this->command->info('LargeOrganizationsSeeder finished.');
    }
}
