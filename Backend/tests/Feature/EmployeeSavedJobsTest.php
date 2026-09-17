<?php

declare(strict_types=1);

namespace Tests\Feature;

use App\Enums\JobStatus;
use App\Models\Category;
use App\Models\Employer;
use App\Models\JobPost;
use App\Models\SavedJob;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class EmployeeSavedJobsTest extends TestCase
{
    use RefreshDatabase;

    private User $employee;
    private User $employerUser;
    private Employer $employer;
    private Category $category;
    private JobPost $publishedJob;

    protected function setUp(): void
    {
        parent::setUp();

        $this->employee = User::factory()->create([
            'role' => 'employee',
            'email_verified_at' => now(),
        ]);

        $this->employerUser = User::factory()->create([
            'role' => 'employer',
            'email_verified_at' => now(),
        ]);

        $this->employer = Employer::factory()->create([
            'user_id' => $this->employerUser->id,
            'company_name' => 'Acme Technologies',
        ]);

        $this->category = Category::create([
            'name' => 'Engineering',
            'slug' => 'engineering',
            'is_active' => true,
        ]);

        $this->publishedJob = JobPost::factory()->published()->create([
            'employer_id' => $this->employer->id,
            'category_id' => $this->category->id,
            'title' => 'Senior Fullstack Engineer',
            'description' => 'Great position with Laravel and React',
            'location' => 'Berlin, Germany',
            'status' => JobStatus::PUBLISHED,
        ]);
    }

    public function test_employee_can_save_a_published_job(): void
    {
        $response = $this->actingAs($this->employee)
            ->postJson("/api/v1/employee/saved-jobs/{$this->publishedJob->id}");

        $response->assertStatus(201)
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.job_post_id', $this->publishedJob->id);

        $this->assertDatabaseHas('saved_jobs', [
            'user_id' => $this->employee->id,
            'job_post_id' => $this->publishedJob->id,
        ]);
    }

    public function test_employee_cannot_save_draft_job(): void
    {
        $draftJob = JobPost::factory()->create([
            'employer_id' => $this->employer->id,
            'category_id' => $this->category->id,
            'status' => JobStatus::DRAFT,
        ]);

        $response = $this->actingAs($this->employee)
            ->postJson("/api/v1/employee/saved-jobs/{$draftJob->id}");

        $response->assertStatus(404);

        $this->assertDatabaseMissing('saved_jobs', [
            'user_id' => $this->employee->id,
            'job_post_id' => $draftJob->id,
        ]);
    }

    public function test_employee_can_list_saved_jobs(): void
    {
        SavedJob::create([
            'user_id' => $this->employee->id,
            'job_post_id' => $this->publishedJob->id,
        ]);

        $response = $this->actingAs($this->employee)
            ->getJson('/api/v1/employee/saved-jobs');

        $response->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonCount(1, 'data.data')
            ->assertJsonPath('data.data.0.job_post.id', $this->publishedJob->id)
            ->assertJsonPath('data.data.0.job_post.title', 'Senior Fullstack Engineer');
    }

    public function test_employee_can_search_and_filter_saved_jobs(): void
    {
        $catDesign = Category::create([
            'name' => 'Design',
            'slug' => 'design',
            'is_active' => true,
        ]);

        $job2 = JobPost::factory()->published()->create([
            'employer_id' => $this->employer->id,
            'category_id' => $catDesign->id,
            'title' => 'UI UX Product Designer',
            'status' => JobStatus::PUBLISHED,
        ]);

        SavedJob::create([
            'user_id' => $this->employee->id,
            'job_post_id' => $this->publishedJob->id,
        ]);

        SavedJob::create([
            'user_id' => $this->employee->id,
            'job_post_id' => $job2->id,
        ]);

        // Search by keyword "Designer"
        $resKeyword = $this->actingAs($this->employee)
            ->getJson('/api/v1/employee/saved-jobs?search=Designer');

        $resKeyword->assertOk()
            ->assertJsonCount(1, 'data.data')
            ->assertJsonPath('data.data.0.job_post.id', $job2->id);

        // Filter by category
        $resCat = $this->actingAs($this->employee)
            ->getJson("/api/v1/employee/saved-jobs?category_id={$this->category->id}");

        $resCat->assertOk()
            ->assertJsonCount(1, 'data.data')
            ->assertJsonPath('data.data.0.job_post.id', $this->publishedJob->id);
    }

    public function test_employee_can_get_saved_job_ids(): void
    {
        SavedJob::create([
            'user_id' => $this->employee->id,
            'job_post_id' => $this->publishedJob->id,
        ]);

        $response = $this->actingAs($this->employee)
            ->getJson('/api/v1/employee/saved-jobs/ids');

        $response->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.0', $this->publishedJob->id);
    }

    public function test_employee_can_unsave_job(): void
    {
        SavedJob::create([
            'user_id' => $this->employee->id,
            'job_post_id' => $this->publishedJob->id,
        ]);

        $response = $this->actingAs($this->employee)
            ->deleteJson("/api/v1/employee/saved-jobs/{$this->publishedJob->id}");

        $response->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.removed', true);

        $this->assertDatabaseMissing('saved_jobs', [
            'user_id' => $this->employee->id,
            'job_post_id' => $this->publishedJob->id,
        ]);
    }

    public function test_employee_can_toggle_saved_job(): void
    {
        // First toggle -> saves
        $saveRes = $this->actingAs($this->employee)
            ->postJson("/api/v1/employee/saved-jobs/{$this->publishedJob->id}/toggle");

        $saveRes->assertOk()
            ->assertJsonPath('data.is_saved', true);

        $this->assertDatabaseHas('saved_jobs', [
            'user_id' => $this->employee->id,
            'job_post_id' => $this->publishedJob->id,
        ]);

        // Second toggle -> removes
        $unsaveRes = $this->actingAs($this->employee)
            ->postJson("/api/v1/employee/saved-jobs/{$this->publishedJob->id}/toggle");

        $unsaveRes->assertOk()
            ->assertJsonPath('data.is_saved', false);

        $this->assertDatabaseMissing('saved_jobs', [
            'user_id' => $this->employee->id,
            'job_post_id' => $this->publishedJob->id,
        ]);
    }

    public function test_employer_cannot_access_employee_saved_jobs(): void
    {
        $response = $this->actingAs($this->employerUser)
            ->getJson('/api/v1/employee/saved-jobs');

        $response->assertStatus(403);
    }

    public function test_unauthenticated_cannot_access_saved_jobs(): void
    {
        $response = $this->getJson('/api/v1/employee/saved-jobs');

        $response->assertStatus(401);
    }
}
