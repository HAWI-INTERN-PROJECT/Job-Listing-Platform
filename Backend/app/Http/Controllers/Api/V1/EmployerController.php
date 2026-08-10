<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\V1\StoreEmployerRequest;
use App\Models\Employer;
use Illuminate\Http\JsonResponse;

class EmployerController extends Controller
{
    public function store(StoreEmployerRequest $request): JsonResponse
    {
        if ($request->user()->employer) {
            return response()->json(['message' => 'Employer profile already exists.'], 422);
        }

        $employer = Employer::create([
            'user_id'      => $request->user()->id,
            'company_name' => $request->company_name,
            'description'  => $request->description,
            'location'     => $request->location,
            'status'       => 'pending',
        ]);

        return response()->json($employer, 201);
    }
}
