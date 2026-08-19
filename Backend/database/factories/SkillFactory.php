<?php

namespace Database\Factories;

use App\Models\JobSeeker;
use App\Models\Skill;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Skill>
 */
class SkillFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'job_seeker_id' => JobSeeker::factory(),
            'name' => fake()->randomElement(['PHP', 'Laravel', 'JavaScript', 'Vue.js', 'React', 'Python', 'SQL', 'Docker', 'Git', 'TailwindCSS']),
            'level' => fake()->randomElement(['beginner', 'intermediate', 'advanced', 'expert']),
        ];
    }
}
