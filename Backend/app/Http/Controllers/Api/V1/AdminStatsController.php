<?php

namespace App\Http\Controllers\Api\V1;

use App\Enums\JobStatus;
use App\Http\Controllers\Controller;
use App\Http\Traits\ApiResponse;
use App\Models\Application;
use App\Models\Employer;
use App\Models\JobPost;
use App\Models\User;
use Illuminate\Http\JsonResponse;

class AdminStatsController extends Controller
{
    use ApiResponse;

    public function index(): JsonResponse
    {
        return $this->success([
            'total_users' => User::count(),
            'active_jobs' => JobPost::where('status', JobStatus::PUBLISHED)->count(),
            'total_applications' => Application::count(),
            'total_companies' => Employer::count(),
            'pending_job_approvals' => JobPost::where('status', JobStatus::PENDING_APPROVAL)->count(),
            'pending_employer_approvals' => Employer::where('approval_status', 'pending')->count(),
            'jobs_approved' => JobPost::where('status', JobStatus::PUBLISHED)->count(),
        ], 'Statistics retrieved successfully');
    }
}
