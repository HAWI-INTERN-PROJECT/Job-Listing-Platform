<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\V1\User\UploadCVRequest;
use App\Http\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\HttpFoundation\StreamedResponse;

class UserCVController extends Controller
{
    use ApiResponse;

    public function upload(UploadCVRequest $request): JsonResponse
    {
        $user = $request->user();

        if ($user->cv_path && Storage::disk('local')->exists($user->cv_path)) {
            Storage::disk('local')->delete($user->cv_path);
        }

        $file = $request->file('cv');

        $path = $file->store('cvs/users', 'local');

        $user->update([
            'cv_path' => $path,
            'cv_uploaded_at' => now(),
        ]);

        return $this->success(
            ['cv_path' => $path],
            'CV uploaded successfully'
        );
    }

    public function download(Request $request): StreamedResponse|JsonResponse
    {
        $user = $request->user();

        if (! $user->cv_path || ! Storage::disk('local')->exists($user->cv_path)) {
            return $this->error('CV not found', 404);
        }

        return Storage::disk('local')->download($user->cv_path);
    }
}
