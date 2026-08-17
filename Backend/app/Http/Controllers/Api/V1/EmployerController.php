<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\V1\Employer\StoreEmployerRequest;
use App\Http\Requests\V1\Employer\UpdateEmployerRequest;
use App\Http\Traits\ApiResponse;
use App\Models\Employer;
use Illuminate\Http\JsonResponse;

class EmployerController extends Controller
{
    use ApiResponse;

    public function index(): JsonResponse
    {
        $employers = Employer::with('user')->paginate(15);

        return $this->success($employers, 'Employers retrieved successfully');
    }

    public function store(StoreEmployerRequest $request): JsonResponse
    {
        $employer = Employer::create([
            ...$request->validated(),
            'user_id' => $request->user()->id,
        ]);

        return $this->created($employer, 'Employer profile created successfully');
    }

    public function show(Employer $employer): JsonResponse
    {
        return $this->success($employer->load('user'), 'Employer retrieved successfully');
    }

    public function update(UpdateEmployerRequest $request, Employer $employer): JsonResponse
    {
        $employer->update($request->validated());

        return $this->success($employer, 'Employer profile updated successfully');
    }

    public function destroy(Employer $employer): JsonResponse
    {
        $employer->delete();

        return $this->deleted('Employer profile deleted successfully');
    }
}
