<?php

namespace Tests\Feature\Api\V1;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class UserCVTest extends TestCase
{
    use RefreshDatabase;

    private User $jobSeeker;

    private User $employer;

    protected function setUp(): void
    {
        parent::setUp();
        $this->jobSeeker = User::factory()->create(['role' => 'employee']);
        $this->employer = User::factory()->create(['role' => 'employer']);
    }

    public function test_job_seeker_can_upload_cv(): void
    {
        $file = UploadedFile::fake()->create('resume.pdf', 500);

        $response = $this->actingAs($this->jobSeeker)
            ->postJson('/api/v1/users/cv/upload', ['cv' => $file]);

        $response->assertStatus(200)
            ->assertJsonPath('data.cv_path', fn($path) => str_contains($path, 'cvs/users'));

        $this->assertNotNull($this->jobSeeker->fresh()->cv_path);
        $this->assertNotNull($this->jobSeeker->fresh()->cv_uploaded_at);
    }

    public function test_employer_cannot_upload_cv(): void
    {
        $file = UploadedFile::fake()->create('resume.pdf', 500);

        $response = $this->actingAs($this->employer)
            ->postJson('/api/v1/users/cv/upload', ['cv' => $file]);

        $response->assertStatus(403);
    }

    public function test_cv_upload_must_be_pdf(): void
    {
        $file = UploadedFile::fake()->create('document.txt', 100);

        $response = $this->actingAs($this->jobSeeker)
            ->postJson('/api/v1/users/cv/upload', ['cv' => $file]);

        $response->assertStatus(422)
            ->assertJsonPath('errors.cv.0', 'CV must be a PDF file');
    }

    public function test_cv_upload_max_2mb(): void
    {
        $file = UploadedFile::fake()->create('resume.pdf', 3000);

        $response = $this->actingAs($this->jobSeeker)
            ->postJson('/api/v1/users/cv/upload', ['cv' => $file]);

        $response->assertStatus(422)
            ->assertJsonPath('errors.cv.0', 'CV must be less than 2MB');
    }

    public function test_job_seeker_can_download_own_cv(): void
    {
        Storage::disk('local')->put('cvs/users/test.pdf', 'fake pdf content');
        $this->jobSeeker->update(['cv_path' => 'cvs/users/test.pdf']);

        $response = $this->actingAs($this->jobSeeker)
            ->getJson('/api/v1/users/cv/download');

        $response->assertStatus(200);
    }

    public function test_download_nonexistent_cv_returns_404(): void
    {
        $response = $this->actingAs($this->jobSeeker)
            ->getJson('/api/v1/users/cv/download');

        $response->assertStatus(404)
            ->assertJsonPath('message', 'CV not found');
    }
}
