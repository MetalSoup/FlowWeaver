<?php

namespace Database\Factories;

use App\Models\Flow;
use App\Models\Site;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Carbon;

class FlowFactory extends Factory
{
    protected $model = Flow::class;

    public function definition(): array
    {
        return [
            'created_at' => Carbon::now(),
            'updated_at' => Carbon::now(),
            'name' => $this->faker->name(),
            'sequence' => $this->faker->words(),

            'site_id' => Site::factory(),
        ];
    }
}
