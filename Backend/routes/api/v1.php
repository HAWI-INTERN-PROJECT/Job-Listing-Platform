<?php

declare(strict_types=1);

use App\Http\Controllers\Api\V1\AdminJobPostController;
use App\Http\Controllers\Api\V1\ApplicationController;
use App\Http\Controllers\Api\V1\AuthController;
use App\Http\Controllers\Api\V1\CategoryController;
use App\Http\Controllers\Api\V1\EmployerController;
use App\Http\Controllers\Api\V1\JobPostController;
use App\Http\Middleware\EnsureRole;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API V1 Routes
|--------------------------------------------------------------------------
|
| Routes for API version 1.
|
*/

// Health check
Route::get('health', fn () => response()->json([
    'status' => 'healthy',
    'timestamp' => now()->toDateTimeString(),
]))->name('api.v1.health');

// Public routes with auth rate limiter (5/min - brute force protection)
Route::middleware('throttle:auth')->group(function (): void {
    Route::post('register', [AuthController::class, 'register'])->name('api.v1.register');
    Route::post('login', [AuthController::class, 'login'])->name('api.v1.login');
});

// Email verification
Route::get('email/verify/{id}/{hash}', [AuthController::class, 'verifyEmail'])
    ->middleware('signed')
    ->name('verification.verify');

// Protected routes with authenticated rate limiter (120/min)
Route::middleware(['auth:sanctum', 'throttle:authenticated'])->group(function (): void {
    Route::post('logout', [AuthController::class, 'logout'])->name('api.v1.logout');
    Route::get('profile', [AuthController::class, 'profile'])->name('api.v1.profile');

    // Change password
    Route::put('change-password', [AuthController::class, 'changePassword'])->name('api.v1.change-password');

    Route::post('email/resend', [AuthController::class, 'resendVerificationEmail'])
        ->middleware('throttle:6,1')
        ->name('verification.send');

    // Protected feature routes requiring verified email address
    Route::middleware('verified')->group(function (): void {
        // Administrator Routes
        Route::middleware(EnsureRole::class.':admin')->prefix('admin')->group(function (): void {
            Route::get('dashboard', fn () => response()->json([
                'success' => true,
                'message' => 'Welcome Administrator',
            ]))->name('api.v1.admin.dashboard');
            Route::get('categories', [CategoryController::class, 'adminIndex'])->name('api.v1.admin.categories.index');

            // Admin Job Moderation Workflow
            Route::prefix('jobs')->name('api.v1.admin.jobs.')->group(function (): void {
                Route::get('pending', [AdminJobPostController::class, 'pendingIndex'])->name('pending');
                Route::post('{jobPost}/approve', [AdminJobPostController::class, 'approve'])->name('approve');
                Route::post('{jobPost}/reject', [AdminJobPostController::class, 'reject'])->name('reject');
            });
        });

        // Employer Routes
        Route::middleware(EnsureRole::class.':employer')->prefix('employer')->group(function (): void {
            Route::get('dashboard', fn () => response()->json([
                'success' => true,
                'message' => 'Welcome Employer',
            ]))->name('api.v1.employer.dashboard');

            // Employer Job Post Management
            Route::prefix('jobs')->name('api.v1.employer.jobs.')->group(function (): void {
                Route::get('/', [JobPostController::class, 'employerIndex'])->name('index');
                Route::post('/', [JobPostController::class, 'store'])->name('store');
                Route::put('{jobPost}', [JobPostController::class, 'update'])->name('update');
                Route::delete('{jobPost}', [JobPostController::class, 'destroy'])->name('destroy');
                Route::post('{jobPost}/submit', [JobPostController::class, 'submit'])->name('submit');
                Route::post('{jobPost}/close', [JobPostController::class, 'close'])->name('close');
                Route::get('{jobPost}/applicants', [ApplicationController::class, 'jobApplicants'])->name('applicants');
            });

            // Application status management
            Route::put('applications/{application}/status', [ApplicationController::class, 'updateStatus'])->name('api.v1.employer.applications.status');
        });

        // Employee Routes
        Route::middleware(EnsureRole::class.':employee')->prefix('employee')->group(function (): void {
            Route::get('dashboard', fn () => response()->json([
                'success' => true,
                'message' => 'Welcome Employee',
            ]))->name('api.v1.employee.dashboard');

            // Job Applications
            Route::prefix('applications')->name('api.v1.employee.applications.')->group(function (): void {
                Route::get('/', [ApplicationController::class, 'index'])->name('index');
            });
        });

        // Apply to a job post (employee role, enforced in FormRequest)
        Route::post('jobs/{jobPost}/apply', [ApplicationController::class, 'store'])->name('api.v1.jobs.apply');

        // Employer approval routes (Admin controlled with internal role check)
        Route::prefix('employers')->name('api.v1.employers.')->group(function (): void {
            Route::get('pending', [EmployerController::class, 'pending'])->name('pending');
            Route::put('{employer}/approval-status', [EmployerController::class, 'updateApprovalStatus'])->name('approval-status');
        });

        // Employer profiles - protected by auth:sanctum, verified & employer role
        Route::middleware(EnsureRole::class.':employer')->prefix('employers')->name('api.v1.employers.')->group(function (): void {
            Route::get('/', [EmployerController::class, 'index'])->name('index');
            Route::post('/', [EmployerController::class, 'store'])->name('store');
            Route::get('{employer}', [EmployerController::class, 'show'])->name('show');
            Route::put('{employer}', [EmployerController::class, 'update'])->name('update');
            Route::delete('{employer}', [EmployerController::class, 'destroy'])->name('destroy');
        });

        // Category management - admin only & verified
        Route::middleware(EnsureRole::class.':admin')->prefix('categories')->name('api.v1.categories.')->group(function (): void {
            Route::post('/', [CategoryController::class, 'store'])->name('store');
            Route::put('{category}', [CategoryController::class, 'update'])->name('update');
            Route::delete('{category}', [CategoryController::class, 'destroy'])->name('destroy');
        });
    });
});

// Password reset routes (public with rate limiting)
Route::middleware('throttle:6,1')->group(function (): void {
    Route::post('forgot-password', [AuthController::class, 'forgotPassword'])
        ->name('password.email');
    Route::post('reset-password', [AuthController::class, 'resetPassword'])
        ->name('password.reset');
});

// Public category browsing (no auth required)
Route::prefix('categories')->name('api.v1.categories.')->group(function (): void {
    Route::get('/', [CategoryController::class, 'index'])->name('index');
    Route::get('{category}', [CategoryController::class, 'show'])->name('show');
});

// Public Job Post Browsing
Route::prefix('jobs')->name('api.v1.jobs.')->group(function (): void {
    Route::get('/', [JobPostController::class, 'index'])->name('index');
    Route::get('{jobPost:slug}', [JobPostController::class, 'show'])->name('show');
});
