<?php

namespace Database\Factories;

use App\Models\Instance;
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
            'name' => $this->faker->name(),
            'content' => $this->faker->word(),

            'instance_id' => Instance::factory(),
            'user_id' => User::factory(),
        ];
    }
}
