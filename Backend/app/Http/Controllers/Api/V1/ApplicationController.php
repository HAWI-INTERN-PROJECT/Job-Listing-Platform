<?php

namespace App\Http\Controllers\Api\V1;

use App\Enums\ApplicationStatus;
use App\Http\Controllers\Controller;
use App\Http\Requests\V1\Application\StoreApplicationRequest;
use App\Http\Traits\ApiResponse;
use App\Models\Application;
use App\Models\JobPost;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Symfony\Component\HttpFoundation\StreamedResponse;

class ApplicationController extends Controller
{
    use ApiResponse;

    /**
     * Job seeker applies to a job post.
     */
    public function store(StoreApplicationRequest $request, JobPost $jobPost): JsonResponse
    {
        $user = $request->user();

        if (! $user->cv_path || ! Storage::disk('local')->exists($user->cv_path)) {
            return $this->error('Please upload your CV before applying.', 422);
        }

        if (Application::where('user_id', $user->id)->where('job_post_id', $jobPost->id)->exists()) {
            return $this->error('You have already applied to this job.', 409);
        }

        // Snapshot the CV so future re-uploads don't affect this application
        $snapshotPath = 'cvs/applications/'.Str::uuid().'.pdf';
        Storage::disk('local')->copy($user->cv_path, $snapshotPath);

        $application = Application::create([
            'user_id' => $user->id,
            'job_post_id' => $jobPost->id,
            'cv_path' => $snapshotPath,
            'cover_letter' => $request->validated('cover_letter'),
            'status' => ApplicationStatus::SUBMITTED,
        ]);

        return $this->created($application, 'Application submitted successfully');
    }

    /**
     * List the authenticated job seeker's own applications.
     */
    public function index(Request $request): JsonResponse
    {
        $applications = Application::with('jobPost')
            ->where('user_id', $request->user()->id)
            ->paginate(15);

        return $this->success($applications, 'Applications retrieved successfully');
    }

    /**
     * List applicants for a specific job post (employer view).
     */
    public function jobApplicants(Request $request, JobPost $jobPost): JsonResponse
    {
        $employer = $request->user()->employer;

        if (! $employer || $jobPost->employer_id !== $employer->id) {
            return $this->error('Unauthorized', 403);
        }

        $applications = Application::with('user')
            ->where('job_post_id', $jobPost->id)
            ->paginate(15);

        return $this->success($applications, 'Applicants retrieved successfully');
    }

    /**
     * Update an application's status (employer only, for their own job posts).
     */
    public function updateStatus(Request $request, Application $application): JsonResponse
    {
        $employer = $request->user()->employer;

        if (! $employer || $application->jobPost->employer_id !== $employer->id) {
            return $this->error('Unauthorized', 403);
        }

        $request->validate([
            'status' => 'required|in:submitted,under_review,shortlisted,rejected,hired',
        ]);

        $application->update(['status' => $request->status]);

        return $this->success($application, 'Application status updated successfully');
    }

    /**
     * Download an applicant's CV (employer only, for their own job posts).
     */
    public function downloadCv(Request $request, Application $application): StreamedResponse|JsonResponse
    {
        $employer = $request->user()->employer;

        if (! $employer || $application->jobPost->employer_id !== $employer->id) {
            return $this->error('Unauthorized', 403);
        }

        if (! Storage::disk('local')->exists($application->cv_path)) {
            return $this->error('CV not found', 404);
        }

        return Storage::disk('local')->download($application->cv_path);
    }
}
