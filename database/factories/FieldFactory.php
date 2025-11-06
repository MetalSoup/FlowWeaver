<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Field>
 */
class FieldFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $types = ['text', 'textarea', 'number', 'select', 'checkbox', 'radio', 'date', 'email'];
        $type = $this->faker->randomElement($types);

        // default to null for non-option types
        $options = null;
        if (in_array($type, ['select', 'checkbox', 'radio'])) {
            // generate between 2 and 6 choices in the requested shape
            $count = $this->faker->numberBetween(2, 6);
            $answers = [];
            for ($i = 0; $i < $count; $i++) {
                $label = ucfirst($this->faker->words($this->faker->numberBetween(1, 2), true));
                // create an id like ans-<alphanum>-<alphanum>
                $id = 'ans-' . $this->faker->regexify('[a-z0-9]{8}') . '-' . $this->faker->regexify('[a-z0-9]{6}');
                // basic slugify for value
                $value = strtolower(preg_replace('/[^a-z0-9]+/i', '-', trim($label)));

                $answers[] = [
                    'id' => $id,
                    'label' => $label,
                    'value' => $value,
                    'selected' => false,
                ];
            }

            $options = ['answers' => $answers];
        }

        // Use uniqid() to avoid exhausting Faker's unique() pool when generating many rows
        $baseName = $this->faker->word();
        $uniqueName = uniqid($baseName . '_');

        return [
            'name' => $uniqueName,
            'label' => ucfirst($this->faker->words($this->faker->numberBetween(1, 3), true)),
            // don't set instance_id here so seeder can assign it explicitly
            'type' => $type,
            'options' => $options,
            'description' => $this->faker->optional()->sentence(),
        ];
    }
}
