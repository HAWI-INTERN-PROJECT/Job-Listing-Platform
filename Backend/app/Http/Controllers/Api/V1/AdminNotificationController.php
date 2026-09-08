<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\V1\NotificationResource;
use App\Http\Traits\ApiResponse;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminNotificationController extends Controller
{
    use ApiResponse;

    /**
     * Display a paginated listing of notifications for the authenticated admin.
     */
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();

        $query = $request->boolean('unread')
            ? $user->unreadNotifications()
            : $user->notifications();

        $notifications = $query->paginate($request->integer('per_page', 15));

        return $this->success(
            NotificationResource::collection($notifications)->response()->getData(true),
            'Notifications retrieved successfully'
        );
    }

    /**
     * Get the count of unread notifications for the admin.
     */
    public function unreadCount(Request $request): JsonResponse
    {
        $unreadCount = $request->user()->unreadNotifications()->count();

        return $this->success([
            'unread_count' => $unreadCount,
        ], 'Unread notification count retrieved successfully');
    }

    /**
     * Mark a specific notification as read.
     */
    public function markAsRead(Request $request, string $id): JsonResponse
    {
        try {
            $notification = $request->user()->notifications()->where('id', $id)->firstOrFail();
            $notification->markAsRead();

            return $this->success(
                new NotificationResource($notification),
                'Notification marked as read'
            );
        } catch (ModelNotFoundException) {
            return $this->notFound('Notification not found');
        }
    }

    /**
     * Mark all unread notifications as read.
     */
    public function markAllAsRead(Request $request): JsonResponse
    {
        $request->user()->unreadNotifications()->update(['read_at' => now()]);

        return $this->success(null, 'All notifications marked as read');
    }

    /**
     * Delete a specific notification.
     */
    public function destroy(Request $request, string $id): JsonResponse
    {
        try {
            $notification = $request->user()->notifications()->where('id', $id)->firstOrFail();
            $notification->delete();

            return $this->deleted('Notification deleted successfully');
        } catch (ModelNotFoundException) {
            return $this->notFound('Notification not found');
        }
    }
}
