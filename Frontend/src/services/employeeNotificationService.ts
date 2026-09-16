import api from '@/lib/api'
import type { ApiResponse, EmployeeNotification } from '@/types'

export interface GetEmployeeNotificationsParams {
  unread?: boolean
  page?: number
  per_page?: number
}

export interface PaginatedEmployeeNotifications {
  data: EmployeeNotification[]
  current_page: number
  last_page: number
  total: number
  per_page: number
}

export const employeeNotificationService = {
  /**
   * Fetch paginated list of notifications for employee.
   */
  async getNotifications(params?: GetEmployeeNotificationsParams): Promise<PaginatedEmployeeNotifications> {
    const response = await api.get<ApiResponse<PaginatedEmployeeNotifications>>('/employee/notifications', {
      params: {
        unread: params?.unread ? 1 : undefined,
        page: params?.page,
        per_page: params?.per_page,
      },
    })
    return response.data.data
  },

  /**
   * Get unread notification count for employee.
   */
  async getUnreadCount(): Promise<number> {
    const response = await api.get<ApiResponse<{ unread_count: number }>>('/employee/notifications/unread-count')
    return response.data.data.unread_count
  },

  /**
   * Mark a single notification as read.
   */
  async markAsRead(id: string): Promise<EmployeeNotification> {
    const response = await api.patch<ApiResponse<EmployeeNotification>>(`/employee/notifications/${id}/read`)
    return response.data.data
  },

  /**
   * Mark all unread notifications as read.
   */
  async markAllAsRead(): Promise<void> {
    await api.post('/employee/notifications/mark-all-read')
  },

  /**
   * Delete a single notification.
   */
  async deleteNotification(id: string): Promise<void> {
    await api.delete(`/employee/notifications/${id}`)
  },
}
