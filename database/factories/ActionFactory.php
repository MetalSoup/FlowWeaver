<?php

namespace Database\Factories;

use App\Models\Action;
use Illuminate\Database\Eloquent\Factories\Factory;

class ActionFactory extends Factory
{
    protected $model = Action::class;

    public function definition()
    {
        return [
            'submission_id' => null,
            'email' => $this->faker->optional()->safeEmail(),
            'flow_id' => null,
            'node_id' => 'webhook_'.substr(sha1((string)rand()), 0, 6),
            'event' => 'webhook_request',
            'request_body' => null,
            'request_headers' => [],
            'response_body' => null,
            'response_headers' => [],
            'sent_values' => [],
            'meta' => [],
        ];
    }
}

