<?php

declare(strict_types=1);

use App\Http\Controllers\Api\V1\AuthController;
use App\Http\Controllers\Api\V1\CategoryController;
use App\Http\Controllers\Api\V1\EmployerController;
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

    // Role-protected route groups

    // Administrator Routes
    Route::middleware(EnsureRole::class.':admin')->prefix('admin')->group(function (): void {
        Route::get('dashboard', fn () => response()->json([
            'success' => true,
            'message' => 'Welcome Administrator',
        ]))->name('api.v1.admin.dashboard');
    });

    // Employer Routes
    Route::middleware(EnsureRole::class.':employer')->prefix('employer')->group(function (): void {
        Route::get('dashboard', fn () => response()->json([
            'success' => true,
            'message' => 'Welcome Employer',
        ]))->name('api.v1.employer.dashboard');
    });

    // Employee Routes
    Route::middleware(EnsureRole::class.':employee')->prefix('employee')->group(function (): void {
        Route::get('dashboard', fn () => response()->json([
            'success' => true,
            'message' => 'Welcome Employee',
        ]))->name('api.v1.employee.dashboard');
    });

    // Employer profiles - protected by auth:sanctum
    Route::prefix('employers')->name('api.v1.employers.')->group(function (): void {
        Route::get('/', [EmployerController::class, 'index'])->name('index');
        Route::post('/', [EmployerController::class, 'store'])->name('store');
        Route::get('{employer}', [EmployerController::class, 'show'])->name('show');
        Route::put('{employer}', [EmployerController::class, 'update'])->name('update');
        Route::delete('{employer}', [EmployerController::class, 'destroy'])->name('destroy');
    });

    // Category management - admin only
    Route::prefix('categories')->name('api.v1.categories.')->group(function (): void {
        Route::post('/', [CategoryController::class, 'store'])->name('store');
        Route::put('{category}', [CategoryController::class, 'update'])->name('update');
        Route::delete('{category}', [CategoryController::class, 'destroy'])->name('destroy');
    });

    Route::get('admin/categories', [CategoryController::class, 'adminIndex'])->name('api.v1.admin.categories.index');
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
