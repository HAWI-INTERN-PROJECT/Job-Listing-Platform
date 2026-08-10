<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\V1\StoreApplicationRequest;
use App\Models\Application;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ApplicationController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $applications = $request->user()->applications()->with('job')->get();

        return response()->json($applications);
    }

    public function store(StoreApplicationRequest $request): JsonResponse
    {
        $exists = Application::where('job_id', $request->job_id)
            ->where('user_id', $request->user()->id)
            ->exists();

        if ($exists) {
            return response()->json(['message' => 'You already applied to this job.'], 422);
        }

        $application = Application::create([
            'job_id'  => $request->job_id,
            'user_id' => $request->user()->id,
            'status'  => 'submitted',
        ]);

        return response()->json($application, 201);
    }

    public function updateStatus(Request $request, Application $application): JsonResponse
    {
        $request->validate([
            'status' => 'required|in:submitted,rejected,hired',
        ]);

        $application->update(['status' => $request->status]);

        return response()->json($application);
    }
}
