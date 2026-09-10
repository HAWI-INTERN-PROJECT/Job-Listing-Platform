import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Bell,
  Check,
  CheckCheck,
  BriefcaseBusiness,
  Building2,
  Trash2,
  Clock,
  Loader2,
} from 'lucide-react'
import { toast } from 'sonner'
import { adminNotificationService } from '@/services/adminNotificationService'
import type { AdminNotification } from '@/types'

export default function AdminNotificationDropdown() {
  const [isOpen, setIsOpen] = useState(false)
  const [filterUnread, setFilterUnread] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  // Poll unread count every 30 seconds as background fallback
  const { data: unreadCount = 0 } = useQuery({
    queryKey: ['admin-notifications-unread-count'],
    queryFn: () => adminNotificationService.getUnreadCount(),
    refetchInterval: 30000,
  })

  // Fetch notifications list
  const {
    data: notificationsData,
    isLoading,
  } = useQuery({
    queryKey: ['admin-notifications', filterUnread],
    queryFn: () => adminNotificationService.getNotifications({ unread: filterUnread || undefined, per_page: 15 }),
    refetchInterval: isOpen ? 15000 : 30000,
  })

  // Mark single notification as read mutation
  const markAsReadMutation = useMutation({
    mutationFn: (id: string) => adminNotificationService.markAsRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-notifications'] })
      queryClient.invalidateQueries({ queryKey: ['admin-notifications-unread-count'] })
    },
    onError: () => {
      toast.error('Failed to mark notification as read')
    },
  })

  // Mark all notifications as read mutation
  const markAllAsReadMutation = useMutation({
    mutationFn: () => adminNotificationService.markAllAsRead(),
    onSuccess: () => {
      queryClient.setQueryData(['admin-notifications-unread-count'], 0)
      queryClient.invalidateQueries({ queryKey: ['admin-notifications'] })
      queryClient.invalidateQueries({ queryKey: ['admin-notifications-unread-count'] })
      toast.success('All notifications marked as read')
    },
    onError: () => {
      toast.error('Failed to mark all as read')
    },
  })

  // Delete notification mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => adminNotificationService.deleteNotification(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-notifications'] })
      queryClient.invalidateQueries({ queryKey: ['admin-notifications-unread-count'] })
      toast.success('Notification deleted')
    },
    onError: () => {
      toast.error('Failed to delete notification')
    },
  })

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  const handleNotificationClick = (notification: AdminNotification) => {
    if (!notification.is_read) {
      markAsReadMutation.mutate(notification.id)
    }

    setIsOpen(false)

    const targetUrl = notification.data.action_url
    if (targetUrl) {
      navigate(targetUrl)
    }
  }

  const notifications = notificationsData?.data ?? []

  const getNotificationIcon = (type?: string) => {
    switch (type) {
      case 'job_submitted_for_review':
        return <BriefcaseBusiness size={18} className="text-blue-600" />
      case 'employer_pending_approval':
        return <Building2 size={18} className="text-amber-600" />
      default:
        return <Bell size={18} className="text-slate-600" />
    }
  }

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-lg hover:bg-slate-100 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/20"
        title={unreadCount > 0 ? `${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}` : 'Admin Notifications'}
        aria-label="Admin Notifications"
        aria-expanded={isOpen}
      >
        <Bell size={21} className="text-slate-700" />
        {unreadCount > 0 && (
          <span
            className="absolute -top-1 -right-1 flex items-center justify-center min-w-[20px] h-[20px] px-1.5 bg-red-600 text-white text-[11px] font-bold rounded-full border-2 border-white shadow-sm ring-1 ring-red-500/20 animate-pulse"
            aria-live="polite"
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-xl border border-slate-200 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
          {/* Header */}
          <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-slate-900 text-sm">Notifications</h3>
              {unreadCount > 0 && (
                <span className="bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded-full font-medium">
                  {unreadCount} new
                </span>
              )}
            </div>

            {unreadCount > 0 && (
              <button
                onClick={() => markAllAsReadMutation.mutate()}
                disabled={markAllAsReadMutation.isPending}
                className="text-xs text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1 transition-colors disabled:opacity-50"
              >
                <CheckCheck size={14} />
                Mark all read
              </button>
            )}
          </div>

          {/* Filter Bar */}
          <div className="flex border-b border-slate-100 px-4 py-2 bg-white text-xs gap-2">
            <button
              onClick={() => setFilterUnread(false)}
              className={`px-2.5 py-1 rounded-md transition-colors ${
                !filterUnread ? 'bg-slate-900 text-white font-medium' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilterUnread(true)}
              className={`px-2.5 py-1 rounded-md transition-colors ${
                filterUnread ? 'bg-slate-900 text-white font-medium' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              Unread only
            </button>
          </div>

          {/* Notifications List */}
          <div className="max-h-[380px] overflow-y-auto divide-y divide-slate-100">
            {isLoading ? (
              <div className="p-8 text-center text-slate-400 flex flex-col items-center gap-2">
                <Loader2 size={24} className="animate-spin text-blue-600" />
                <span className="text-xs">Loading notifications...</span>
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-8 text-center text-slate-400 flex flex-col items-center gap-2">
                <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-1">
                  <Bell size={20} />
                </div>
                <p className="text-sm font-medium text-slate-700">No notifications</p>
                <p className="text-xs text-slate-400">
                  {filterUnread ? 'No unread notifications right now' : 'You are all caught up!'}
                </p>
              </div>
            ) : (
              notifications.map((item) => (
                <div
                  key={item.id}
                  className={`p-4 flex gap-3 transition-colors hover:bg-slate-50/80 cursor-pointer relative group ${
                    !item.is_read ? 'bg-blue-50/40' : ''
                  }`}
                  onClick={() => handleNotificationClick(item)}
                >
                  {/* Icon Indicator */}
                  <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    {getNotificationIcon(item.data.type)}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0 pr-6">
                    <div className="flex items-center gap-1.5">
                      <p className={`text-xs font-semibold ${!item.is_read ? 'text-slate-900' : 'text-slate-700'}`}>
                        {item.data.title ?? 'System Notification'}
                      </p>
                      {!item.is_read && (
                        <span className="w-1.5 h-1.5 bg-blue-600 rounded-full flex-shrink-0" />
                      )}
                    </div>
                    <p className="text-xs text-slate-600 mt-1 line-clamp-2 leading-relaxed">
                      {item.data.message}
                    </p>
                    <div className="flex items-center gap-1 mt-1.5 text-[11px] text-slate-400">
                      <Clock size={12} />
                      <span>{item.created_at_human ?? new Date(item.created_at).toLocaleString()}</span>
                    </div>
                  </div>

                  {/* Item Actions */}
                  <div
                    className="absolute right-3 top-3 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {!item.is_read && (
                      <button
                        onClick={() => markAsReadMutation.mutate(item.id)}
                        className="p-1 rounded text-slate-400 hover:text-blue-600 hover:bg-white transition-colors"
                        title="Mark as read"
                      >
                        <Check size={14} />
                      </button>
                    )}
                    <button
                      onClick={() => deleteMutation.mutate(item.id)}
                      className="p-1 rounded text-slate-400 hover:text-red-600 hover:bg-white transition-colors"
                      title="Delete"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="p-2.5 border-t border-slate-100 bg-slate-50/50 text-center">
              <button
                onClick={() => {
                  setIsOpen(false)
                  navigate('/admin/jobs')
                }}
                className="text-xs font-medium text-blue-600 hover:text-blue-800 transition-colors"
              >
                View moderation queues →
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
