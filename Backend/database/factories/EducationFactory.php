<?php

namespace Database\Factories;

use App\Models\Education;
use App\Models\JobSeeker;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Education>
 */
class EducationFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $startDate = fake()->dateTimeBetween('-8 years', '-4 years');
        $endDate = fake()->dateTimeBetween($startDate, 'now');

        return [
            'job_seeker_id' => JobSeeker::factory(),
            'institution' => fake()->company() . ' University',
            'degree' => fake()->randomElement(["Bachelor's in Computer Science", "Master's in Business Administration", 'B.S. in Information Technology', 'Diploma in Software Engineering']),
            'start_date' => $startDate->format('Y-m-d'),
            'end_date' => $endDate->format('Y-m-d'),
        ];
    }
}
