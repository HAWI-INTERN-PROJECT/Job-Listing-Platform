<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Enums\JobStatus;
use App\Http\Controllers\Controller;
use App\Http\Resources\V1\SavedJobResource;
use App\Http\Traits\ApiResponse;
use App\Models\JobPost;
use App\Models\SavedJob;
use App\Models\User;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SavedJobController extends Controller
{
    use ApiResponse;

    /**
     * Display a paginated listing of saved jobs for the authenticated employee.
     */
    public function index(Request $request): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();

        $query = SavedJob::query()
            ->where('user_id', $user->id)
            ->with(['jobPost.employer', 'jobPost.category'])
            ->latest();

        if ($search = trim((string) $request->query('search', ''))) {
            $query->whereHas('jobPost', function (Builder $jq) use ($search): void {
                $jq->where('title', 'like', "%{$search}%")
                    ->orWhere('location', 'like', "%{$search}%")
                    ->orWhereHas('employer', function (Builder $eq) use ($search): void {
                        $eq->where('company_name', 'like', "%{$search}%");
                    });
            });
        }

        if ($category = $request->query('category_id') ?? $request->query('category')) {
            $query->whereHas('jobPost', function (Builder $jq) use ($category): void {
                if (is_numeric($category)) {
                    $jq->where('category_id', (int) $category);
                } else {
                    $jq->whereHas('category', function (Builder $cq) use ($category): void {
                        $cq->where('slug', (string) $category)->orWhere('name', (string) $category);
                    });
                }
            });
        }

        $savedJobs = $query->paginate($request->integer('per_page', 15));

        return $this->success(
            SavedJobResource::collection($savedJobs)->response()->getData(true),
            'Saved jobs retrieved successfully'
        );
    }

    /**
     * Get a list of all saved job post IDs for the authenticated employee.
     */
    public function savedJobIds(Request $request): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();

        $ids = SavedJob::where('user_id', $user->id)
            ->pluck('job_post_id')
            ->values()
            ->all();

        return $this->success($ids, 'Saved job IDs retrieved successfully');
    }

    /**
     * Save a job post to the employee's saved list.
     */
    public function store(Request $request, JobPost $jobPost): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();

        if ($jobPost->status !== JobStatus::PUBLISHED) {
            return $this->notFound('Job post not found or is no longer available.');
        }

        $savedJob = SavedJob::firstOrCreate([
            'user_id' => $user->id,
            'job_post_id' => $jobPost->id,
        ]);

        $savedJob->load(['jobPost.employer', 'jobPost.category']);

        return $this->created(
            new SavedJobResource($savedJob),
            'Job saved successfully'
        );
    }

    /**
     * Remove a job post from the employee's saved list.
     */
    public function destroy(Request $request, JobPost $jobPost): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();

        $deleted = SavedJob::where('user_id', $user->id)
            ->where('job_post_id', $jobPost->id)
            ->delete();

        return $this->success(
            [
                'job_post_id' => $jobPost->id,
                'removed' => (bool) $deleted,
            ],
            'Job removed from saved jobs successfully'
        );
    }

    /**
     * Toggle save/unsave state for a job post.
     */
    public function toggle(Request $request, JobPost $jobPost): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();

        if ($jobPost->status !== JobStatus::PUBLISHED) {
            return $this->notFound('Job post not found or is no longer available.');
        }

        $existing = SavedJob::where('user_id', $user->id)
            ->where('job_post_id', $jobPost->id)
            ->first();

        if ($existing) {
            $existing->delete();

            return $this->success([
                'is_saved' => false,
                'job_post_id' => $jobPost->id,
            ], 'Job removed from saved jobs');
        }

        $savedJob = SavedJob::create([
            'user_id' => $user->id,
            'job_post_id' => $jobPost->id,
        ]);

        return $this->success([
            'is_saved' => true,
            'job_post_id' => $jobPost->id,
            'saved_job' => new SavedJobResource($savedJob->load(['jobPost.employer', 'jobPost.category'])),
        ], 'Job saved successfully');
    }
}
