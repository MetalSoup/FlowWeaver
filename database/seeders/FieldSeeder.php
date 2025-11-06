<?php

namespace Database\Seeders;

use App\Models\Field;
use App\Models\Instance;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class FieldSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Chunk instances to avoid loading all into memory
        Instance::chunk(100, function ($instances) {
            foreach ($instances as $instance) {
                $count = rand(10, 200);

                // Create in smaller batches to avoid huge single queries
                $batchSize = 50;
                $remaining = $count;

                while ($remaining > 0) {
                    $cur = min($batchSize, $remaining);

                    // generate array of attributes with instance_id set
                    $attrs = Field::factory()->count($cur)->make()->map(function ($f) use ($instance) {
                        $arr = $f->toArray();
                        $arr['instance_id'] = $instance->id;

                        // Ensure options is stored as JSON string for DB, but keep null when absent
                        if (array_key_exists('options', $arr)) {
                            if (is_array($arr['options']) && count($arr['options'])) {
                                $arr['options'] = json_encode($arr['options']);
                            } elseif (is_object($arr['options']) && method_exists($arr['options'], 'toArray')) {
                                $tmp = $arr['options']->toArray();
                                $arr['options'] = count($tmp) ? json_encode($tmp) : null;
                            } else {
                                // explicitly set to null when factory provides null
                                $arr['options'] = null;
                            }
                        }

                        $timestamp = now()->format('Y-m-d H:i:s');
                        $arr['created_at'] = $timestamp;
                        $arr['updated_at'] = $timestamp;

                        return $arr;
                    })->all();

                    // insert using model for mass assignment / casts
                    Field::insert($attrs);

                    $remaining -= $cur;
                }
            }
        });
    }
}
