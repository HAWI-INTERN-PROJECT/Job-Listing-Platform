<?php

namespace Database\Factories;

use App\Models\Experience;
use App\Models\JobSeeker;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Experience>
 */
class ExperienceFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $startDate = fake()->dateTimeBetween('-5 years', '-1 years');
        $endDate = fake()->boolean(75) ? fake()->dateTimeBetween($startDate, 'now') : null;

        return [
            'job_seeker_id' => JobSeeker::factory(),
            'company' => fake()->company(),
            'title' => fake()->jobTitle(),
            'start_date' => $startDate->format('Y-m-d'),
            'end_date' => $endDate?->format('Y-m-d'),
        ];
    }
}
