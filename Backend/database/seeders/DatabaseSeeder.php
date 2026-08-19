<?php

namespace Database\Seeders;

use App\Models\Application;
use App\Models\Education;
use App\Models\Employer;
use App\Models\Experience;
use App\Models\Job;
use App\Models\JobCategory;
use App\Models\JobSeeker;
use App\Models\Skill;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // 1. Seed Admin User
        User::factory()->admin()->create([
            'name' => 'System Admin',
            'email' => 'admin@example.com',
            'username' => 'sysadmin',
        ]);

        // 2. Seed Job Categories
        $categories = collect([
            'Software Development',
            'Data Science & Analytics',
            'Product Management',
            'UI/UX Design',
            'Digital Marketing',
            'Sales & Business Development',
            'Finance & Accounting',
            'Human Resources',
        ])->map(fn (string $name) => JobCategory::firstOrCreate(['name' => $name]));

        // 3. Seed Employers and Jobs
        $employers = Employer::factory()->count(5)->create();

        $jobs = collect();
        foreach ($employers as $employer) {
            $createdJobs = Job::factory()->count(3)->create([
                'employer_id' => $employer->id,
                'category_id' => $categories->random()->id,
            ]);
            $jobs = $jobs->merge($createdJobs);
        }

        // 4. Seed Job Seekers with Education, Skills, and Experience
        $jobSeekers = JobSeeker::factory()->count(10)->create();

        foreach ($jobSeekers as $seeker) {
            Education::factory()->count(2)->create([
                'job_seeker_id' => $seeker->id,
            ]);

            Skill::factory()->count(4)->create([
                'job_seeker_id' => $seeker->id,
            ]);

            Experience::factory()->count(2)->create([
                'job_seeker_id' => $seeker->id,
            ]);

            // Create 1 to 3 unique applications per job seeker
            $randomJobs = $jobs->random(rand(1, 3));
            foreach ($randomJobs as $job) {
                Application::firstOrCreate([
                    'job_id' => $job->id,
                    'job_seeker_id' => $seeker->id,
                ], [
                    'status' => 'submitted',
                    'applied_at' => now(),
                ]);
            }
        }
    }
}
