<?php

namespace Tests\Feature\Api\V1;

use App\Models\Application;
use App\Models\Employer;
use App\Models\JobPost;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class ApplicationTest extends TestCase
{
    use RefreshDatabase;

    public function test_employee_can_view_own_applications(): void
    {
        $user = User::factory()->create(['role' => 'employee']);
        Application::factory()->count(2)->create(['user_id' => $user->id]);

        $response = $this->actingAs($user, 'sanctum')
            ->getJson('/api/v1/employee/applications');

        $response->assertOk()
            ->assertJsonCount(2, 'data.data');
    }

    public function test_employer_can_view_applicants_for_own_job(): void
    {
        $employerUser = User::factory()->create(['role' => 'employer']);
        $employer = Employer::factory()->create(['user_id' => $employerUser->id]);
        $jobPost = JobPost::factory()->create(['employer_id' => $employer->id]);
        Application::factory()->count(3)->create(['job_post_id' => $jobPost->id]);

        $response = $this->actingAs($employerUser, 'sanctum')
            ->getJson("/api/v1/employer/jobs/{$jobPost->id}/applicants");

        $response->assertOk()
            ->assertJsonCount(3, 'data.data');
    }

    public function test_employer_cannot_view_applicants_for_others_job(): void
    {
        $employerUser = User::factory()->create(['role' => 'employer']);
        Employer::factory()->create(['user_id' => $employerUser->id]);

        $otherEmployer = Employer::factory()->create();
        $jobPost = JobPost::factory()->create(['employer_id' => $otherEmployer->id]);

        $response = $this->actingAs($employerUser, 'sanctum')
            ->getJson("/api/v1/employer/jobs/{$jobPost->id}/applicants");

        $response->assertStatus(403);
    }

    public function test_employer_can_update_application_status(): void
    {
        $employerUser = User::factory()->create(['role' => 'employer']);
        $employer = Employer::factory()->create(['user_id' => $employerUser->id]);
        $jobPost = JobPost::factory()->create(['employer_id' => $employer->id]);
        $application = Application::factory()->create(['job_post_id' => $jobPost->id]);

        $response = $this->actingAs($employerUser, 'sanctum')
            ->putJson("/api/v1/employer/applications/{$application->id}/status", [
                'status' => 'shortlisted',
            ]);

        $response->assertOk();
        $this->assertDatabaseHas('applications', [
            'id' => $application->id,
            'status' => 'shortlisted',
        ]);
    }

    public function test_employer_can_download_applicant_cv(): void
    {
        Storage::fake('local');

        $employerUser = User::factory()->create(['role' => 'employer']);
        $employer = Employer::factory()->create(['user_id' => $employerUser->id]);
        $jobPost = JobPost::factory()->create(['employer_id' => $employer->id]);

        Storage::disk('local')->put('cvs/applications/test.pdf', 'fake pdf content');
        $application = Application::factory()->create([
            'job_post_id' => $jobPost->id,
            'cv_path' => 'cvs/applications/test.pdf',
        ]);

        $response = $this->actingAs($employerUser, 'sanctum')
            ->getJson("/api/v1/employer/applications/{$application->id}/cv");

        $response->assertOk();
    }

    public function test_employer_cannot_download_cv_for_others_application(): void
    {
        $employerUser = User::factory()->create(['role' => 'employer']);
        Employer::factory()->create(['user_id' => $employerUser->id]);

        $otherEmployer = Employer::factory()->create();
        $jobPost = JobPost::factory()->create(['employer_id' => $otherEmployer->id]);
        $application = Application::factory()->create(['job_post_id' => $jobPost->id]);

        $response = $this->actingAs($employerUser, 'sanctum')
            ->getJson("/api/v1/employer/applications/{$application->id}/cv");

        $response->assertStatus(403);
    }
}
