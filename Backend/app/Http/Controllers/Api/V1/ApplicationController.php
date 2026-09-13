<?php

namespace App\Http\Controllers\Api\V1;

use App\Enums\ApplicationStatus;
use App\Http\Controllers\Controller;
use App\Http\Requests\V1\Application\StoreApplicationRequest;
use App\Http\Resources\V1\ApplicationResource;
use App\Http\Traits\ApiResponse;
use App\Models\Application;
use App\Models\JobPost;
use App\Models\User;
use App\Notifications\V1\Employer\NewApplicationReceivedNotification;
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
        /** @var User $user */
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

        $employerUser = $jobPost->employer?->user;
        if ($employerUser) {
            $employerUser->notify(new NewApplicationReceivedNotification($application, $jobPost, $user));
        }

        return $this->created($application, 'Application submitted successfully');
    }

    /**
     * List the authenticated job seeker's own applications.
     */
    public function index(Request $request): JsonResponse
    {
        $applications = Application::with(['jobPost.employer'])
            ->where('user_id', $request->user()->id)
            ->latest()
            ->paginate(15);

        return $this->success(
            ApplicationResource::collection($applications)->response()->getData(true),
            'Applications retrieved successfully'
        );
    }

    /**
     * List applicants for an employer's job post.
     */
    public function jobApplicants(Request $request, JobPost $jobPost): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();

        if ($jobPost->employer_id !== $user->employer?->id) {
            return $this->forbidden('You can only view applicants for your own job posts.');
        }

        $query = Application::with('user:id,name,email,username')
            ->where('job_post_id', $jobPost->id);

        if ($status = $request->input('status')) {
            $query->where('status', $status);
        }

        $applications = $query->latest()->paginate(15);

        return $this->success($applications, 'Applicants retrieved successfully');
    }

    /**
     * Employer updates application status.
     */
    public function updateStatus(Request $request, Application $application): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();

        if ($application->jobPost->employer_id !== $user->employer?->id) {
            return $this->forbidden('You can only update applications for your own job posts.');
        }

        $validated = $request->validate([
            'status' => ['required', 'string', 'in:submitted,reviewed,shortlisted,rejected,accepted'],
        ]);

        $application->update([
            'status' => $validated['status'],
        ]);

        return $this->success($application, 'Application status updated successfully');
    }

    /**
     * Download applicant CV.
     */
    public function downloadCv(Request $request, Application $application): StreamedResponse|JsonResponse
    {
        /** @var User $user */
        $user = $request->user();

        if ($application->jobPost->employer_id !== $user->employer?->id) {
            return $this->forbidden('You can only download CVs for your own job applicants.');
        }

        if (! Storage::disk('local')->exists($application->cv_path)) {
            return $this->notFound('CV file not found.');
        }

        return Storage::disk('local')->download($application->cv_path, 'applicant-cv.pdf');
    }
}
