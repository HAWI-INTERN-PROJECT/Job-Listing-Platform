<?php

namespace Database\Factories;

use App\Models\Employer;
use App\Models\Job;
use App\Models\JobCategory;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Job>
 */
class JobFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'employer_id' => Employer::factory(),
            'category_id' => JobCategory::factory(),
            'title' => fake()->jobTitle(),
            'description' => fake()->paragraphs(3, true),
            'responsibilities' => fake()->paragraph(),
            'requirements' => fake()->paragraph(),
            'location' => fake()->city() . ', ' . fake()->country(),
            'employment_type' => fake()->randomElement(['full_time', 'part_time', 'contract', 'internship']),
            'deadline' => fake()->dateTimeBetween('+1 week', '+2 months')->format('Y-m-d'),
            'positions' => fake()->numberBetween(1, 5),
            'status' => 'approved',
        ];
    }
}
