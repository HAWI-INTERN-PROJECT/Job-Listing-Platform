<?php

namespace Tests\Unit;

use App\Models\Application;
use App\Models\Education;
use App\Models\Employer;
use App\Models\Experience;
use App\Models\Job;
use App\Models\JobCategory;
use App\Models\JobSeeker;
use App\Models\Skill;
use App\Models\User;
use Illuminate\Database\QueryException;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class DatabaseSchemaTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_relationships_with_job_seeker_and_employer(): void
    {
        $user1 = User::factory()->jobSeeker()->create();
        $jobSeeker = JobSeeker::factory()->create(['user_id' => $user1->id]);

        $user2 = User::factory()->employer()->create();
        $employer = Employer::factory()->create(['user_id' => $user2->id]);

        $this->assertTrue($user1->jobSeeker->is($jobSeeker));
        $this->assertTrue($jobSeeker->user->is($user1));

        $this->assertTrue($user2->employer->is($employer));
        $this->assertTrue($employer->user->is($user2));
    }

    public function test_job_seeker_relationships(): void
    {
        $jobSeeker = JobSeeker::factory()->create();

        $education = Education::factory()->create(['job_seeker_id' => $jobSeeker->id]);
        $skill = Skill::factory()->create(['job_seeker_id' => $jobSeeker->id]);
        $experience = Experience::factory()->create(['job_seeker_id' => $jobSeeker->id]);
        $application = Application::factory()->create(['job_seeker_id' => $jobSeeker->id]);

        $this->assertTrue($jobSeeker->education->contains($education));
        $this->assertTrue($education->jobSeeker->is($jobSeeker));

        $this->assertTrue($jobSeeker->skills->contains($skill));
        $this->assertTrue($skill->jobSeeker->is($jobSeeker));

        $this->assertTrue($jobSeeker->experience->contains($experience));
        $this->assertTrue($experience->jobSeeker->is($jobSeeker));

        $this->assertTrue($jobSeeker->applications->contains($application));
        $this->assertTrue($application->jobSeeker->is($jobSeeker));
    }

    public function test_employer_and_job_category_relationships(): void
    {
        $employer = Employer::factory()->create();
        $category = JobCategory::factory()->create();

        $job = Job::factory()->create([
            'employer_id' => $employer->id,
            'category_id' => $category->id,
        ]);

        $this->assertTrue($employer->jobs->contains($job));
        $this->assertTrue($job->employer->is($employer));

        $this->assertTrue($category->jobs->contains($job));
        $this->assertTrue($job->category->is($category));
    }

    public function test_job_and_application_relationships(): void
    {
        $job = Job::factory()->create();
        $application = Application::factory()->create(['job_id' => $job->id]);

        $this->assertTrue($job->applications->contains($application));
        $this->assertTrue($application->job->is($job));
    }

    public function test_application_unique_composite_index_prevents_duplicate_application(): void
    {
        $job = Job::factory()->create();
        $jobSeeker = JobSeeker::factory()->create();

        Application::factory()->create([
            'job_id' => $job->id,
            'job_seeker_id' => $jobSeeker->id,
        ]);

        $this->expectException(QueryException::class);

        Application::factory()->create([
            'job_id' => $job->id,
            'job_seeker_id' => $jobSeeker->id,
        ]);
    }

    public function test_cascade_delete_on_user_deletes_job_seeker_and_employer(): void
    {
        $userSeeker = User::factory()->jobSeeker()->create();
        $jobSeeker = JobSeeker::factory()->create(['user_id' => $userSeeker->id]);

        $userEmployer = User::factory()->employer()->create();
        $employer = Employer::factory()->create(['user_id' => $userEmployer->id]);

        $userSeeker->delete();
        $userEmployer->delete();

        $this->assertDatabaseMissing('job_seekers', ['id' => $jobSeeker->id]);
        $this->assertDatabaseMissing('employers', ['id' => $employer->id]);
    }

    public function test_cascade_delete_on_job_seeker_deletes_child_records(): void
    {
        $jobSeeker = JobSeeker::factory()->create();
        $education = Education::factory()->create(['job_seeker_id' => $jobSeeker->id]);
        $skill = Skill::factory()->create(['job_seeker_id' => $jobSeeker->id]);
        $experience = Experience::factory()->create(['job_seeker_id' => $jobSeeker->id]);
        $application = Application::factory()->create(['job_seeker_id' => $jobSeeker->id]);

        $jobSeeker->delete();

        $this->assertDatabaseMissing('education', ['id' => $education->id]);
        $this->assertDatabaseMissing('skills', ['id' => $skill->id]);
        $this->assertDatabaseMissing('experience', ['id' => $experience->id]);
        $this->assertDatabaseMissing('applications', ['id' => $application->id]);
    }

    public function test_cascade_delete_on_employer_deletes_jobs(): void
    {
        $employer = Employer::factory()->create();
        $job = Job::factory()->create(['employer_id' => $employer->id]);

        $employer->delete();

        $this->assertDatabaseMissing('jobs', ['id' => $job->id]);
    }

    public function test_category_delete_sets_null_on_job(): void
    {
        $category = JobCategory::factory()->create();
        $job = Job::factory()->create(['category_id' => $category->id]);

        $category->delete();

        $this->assertDatabaseHas('jobs', [
            'id' => $job->id,
            'category_id' => null,
        ]);
    }
}
