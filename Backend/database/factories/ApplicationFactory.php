<?php

namespace Database\Factories;

use App\Models\Application;
use App\Models\Job;
use App\Models\JobSeeker;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Application>
 */
class ApplicationFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'job_id' => Job::factory(),
            'job_seeker_id' => JobSeeker::factory(),
            'status' => fake()->randomElement(['submitted', 'under_review', 'shortlisted', 'rejected', 'hired']),
            'applied_at' => now(),
        ];
    }
}
