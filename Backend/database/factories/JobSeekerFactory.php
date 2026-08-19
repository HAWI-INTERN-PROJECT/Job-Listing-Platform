<?php

namespace Database\Factories;

use App\Models\JobSeeker;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<JobSeeker>
 */
class JobSeekerFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'user_id' => User::factory()->jobSeeker(),
            'cv_path' => 'cvs/' . fake()->uuid() . '.pdf',
            'phone' => fake()->phoneNumber(),
            'location' => fake()->city() . ', ' . fake()->country(),
        ];
    }
}
