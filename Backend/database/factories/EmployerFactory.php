<?php

namespace Database\Factories;

use App\Models\Employer;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Employer>
 */
class EmployerFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'user_id' => User::factory()->employer(),
            'company_name' => fake()->company(),
            'logo_path' => 'logos/' . fake()->uuid() . '.png',
            'description' => fake()->paragraph(),
            'location' => fake()->city() . ', ' . fake()->country(),
            'is_approved' => true,
            'user_id' => User::factory()->state(['role' => 'employer'])->create()->id,
            'company_name' => fake()->company(),
            'description' => fake()->paragraph(),
            'logo' => null,
            'website' => fake()->url(),
            'location' => fake()->city(),
        ];
    }
}
