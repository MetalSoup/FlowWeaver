<?php

namespace Database\Factories;

use App\Models\Site;
use App\Models\Page;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Carbon;

class PageFactory extends Factory
{
    protected $model = Page::class;

    public function definition(): array
    {
        return [
            'created_at' => Carbon::now(),
            'updated_at' => Carbon::now(),
            'name' => $this->faker->sentence(3),
            // content must be valid JSON for the JSON column
            'content' => json_encode(['ROOT' => ['type' => 'CraftContainer', 'props' => []]]),

            'site_id' => Site::factory(),
            'user_id' => User::factory(),
        ];
    }
}
