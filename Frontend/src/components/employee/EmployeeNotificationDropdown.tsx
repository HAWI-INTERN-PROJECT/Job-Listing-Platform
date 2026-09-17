import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Bell,
  Check,
  CheckCheck,
  CheckCircle2,
  XCircle,
  Briefcase,
  Trash2,
  Clock,
  Loader2,
  Award,
} from 'lucide-react'
import { toast } from 'sonner'
import { employeeNotificationService } from '@/services/employeeNotificationService'
import type { EmployeeNotification } from '@/types'

export default function EmployeeNotificationDropdown() {
  const [isOpen, setIsOpen] = useState(false)
  const [filterUnread, setFilterUnread] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  // Poll unread count every 30 seconds as background fallback
  const { data: unreadCount = 0 } = useQuery({
    queryKey: ['employee-notifications-unread-count'],
    queryFn: () => employeeNotificationService.getUnreadCount(),
    refetchInterval: 30000,
  })

  // Fetch notifications list
  const {
    data: notificationsData,
    isLoading,
  } = useQuery({
    queryKey: ['employee-notifications', filterUnread],
    queryFn: () => employeeNotificationService.getNotifications({ unread: filterUnread || undefined, per_page: 15 }),
    refetchInterval: isOpen ? 15000 : 30000,
  })

  // Mark single notification as read mutation
  const markAsReadMutation = useMutation({
    mutationFn: (id: string) => employeeNotificationService.markAsRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employee-notifications'] })
      queryClient.invalidateQueries({ queryKey: ['employee-notifications-unread-count'] })
    },
    onError: () => {
      toast.error('Failed to mark notification as read')
    },
  })

  // Mark all notifications as read mutation
  const markAllAsReadMutation = useMutation({
    mutationFn: () => employeeNotificationService.markAllAsRead(),
    onSuccess: () => {
      queryClient.setQueryData(['employee-notifications-unread-count'], 0)
      queryClient.invalidateQueries({ queryKey: ['employee-notifications'] })
      queryClient.invalidateQueries({ queryKey: ['employee-notifications-unread-count'] })
      toast.success('All notifications marked as read')
    },
    onError: () => {
      toast.error('Failed to mark all as read')
    },
  })

  // Delete notification mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => employeeNotificationService.deleteNotification(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employee-notifications'] })
      queryClient.invalidateQueries({ queryKey: ['employee-notifications-unread-count'] })
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

  const notifications = notificationsData?.data ?? []

  const handleNotificationClick = (item: EmployeeNotification) => {
    if (!item.is_read) {
      markAsReadMutation.mutate(item.id)
    }
    setIsOpen(false)
    const url = item.data?.action_url || '/my-applications'
    navigate(url)
  }

  const getNotificationIcon = (item: EmployeeNotification) => {
    const status = item.data?.status?.toLowerCase()

    if (status === 'hired') {
      return <Award size={18} className="text-emerald-600 dark:text-emerald-400" />
    }
    if (status === 'rejected') {
      return <XCircle size={18} className="text-rose-600 dark:text-rose-400" />
    }
    if (status === 'shortlisted') {
      return <CheckCircle2 size={18} className="text-blue-600 dark:text-blue-400" />
    }
    return <Briefcase size={18} className="text-indigo-600 dark:text-indigo-400" />
  }

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative rounded-full p-2 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
        aria-label="Employee Notifications"
        title="Notifications"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-600 px-1 text-[10px] font-bold text-white leading-none shadow-sm animate-pulse">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-background rounded-xl shadow-xl border border-border z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
          {/* Header */}
          <div className="p-4 border-b border-border flex items-center justify-between bg-muted/40">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-foreground text-sm">Notifications</h3>
              {unreadCount > 0 && (
                <span className="bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 text-xs px-2 py-0.5 rounded-full font-medium">
                  {unreadCount} new
                </span>
              )}
            </div>

            {unreadCount > 0 && (
              <button
                onClick={() => markAllAsReadMutation.mutate()}
                disabled={markAllAsReadMutation.isPending}
                className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium flex items-center gap-1 transition-colors disabled:opacity-50 cursor-pointer"
              >
                <CheckCheck size={14} />
                Mark all read
              </button>
            )}
          </div>

          {/* Filter Bar */}
          <div className="flex border-b border-border px-4 py-2 bg-background text-xs gap-2">
            <button
              onClick={() => setFilterUnread(false)}
              className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                !filterUnread
                  ? 'bg-muted text-foreground font-medium'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilterUnread(true)}
              className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                filterUnread
                  ? 'bg-muted text-foreground font-medium'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Unread
            </button>
          </div>

          {/* Notifications List */}
          <div className="max-h-[380px] overflow-y-auto divide-y divide-border">
            {isLoading ? (
              <div className="p-8 text-center text-muted-foreground flex flex-col items-center gap-2">
                <Loader2 size={24} className="animate-spin text-blue-600" />
                <span className="text-xs">Loading notifications...</span>
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground flex flex-col items-center gap-2">
                <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center text-muted-foreground mb-1">
                  <Bell size={20} />
                </div>
                <p className="text-sm font-medium text-foreground">No notifications</p>
                <p className="text-xs text-muted-foreground">
                  {filterUnread ? 'No unread notifications right now' : 'You are all caught up!'}
                </p>
              </div>
            ) : (
              notifications.map((item) => (
                <div
                  key={item.id}
                  className={`p-4 flex gap-3 transition-colors hover:bg-muted/60 cursor-pointer relative group ${
                    !item.is_read ? 'bg-blue-50/40 dark:bg-blue-950/20' : ''
                  }`}
                  onClick={() => handleNotificationClick(item)}
                >
                  {/* Icon Indicator */}
                  <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center flex-shrink-0 mt-0.5">
                    {getNotificationIcon(item)}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0 pr-6">
                    <div className="flex items-center gap-1.5">
                      <p className={`text-xs font-semibold ${!item.is_read ? 'text-foreground font-bold' : 'text-foreground/80'}`}>
                        {item.data?.title ?? 'Application Status Updated'}
                      </p>
                      {!item.is_read && (
                        <span className="w-1.5 h-1.5 bg-blue-600 rounded-full flex-shrink-0" />
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2 leading-relaxed">
                      {item.data?.message}
                    </p>
                    {item.data?.status && (
                      <div className="mt-2">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium capitalize ${
                          item.data.status.toLowerCase() === 'hired'
                            ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20'
                            : item.data.status.toLowerCase() === 'rejected'
                            ? 'bg-rose-500/10 text-rose-700 dark:text-rose-300 border border-rose-500/20'
                            : 'bg-blue-500/10 text-blue-700 dark:text-blue-300 border border-blue-500/20'
                        }`}>
                          {item.data.status_label || item.data.status}
                        </span>
                      </div>
                    )}
                    <div className="flex items-center gap-1 mt-1.5 text-[11px] text-muted-foreground">
                      <Clock size={12} />
                      <span>{item.created_at_human ?? new Date(item.created_at).toLocaleString()}</span>
                    </div>
                  </div>

                  {/* Action buttons (hover or right aligned) */}
                  <div className="absolute right-2 top-3 flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
                    {!item.is_read && (
                      <button
                        title="Mark as read"
                        onClick={(e) => {
                          e.stopPropagation()
                          markAsReadMutation.mutate(item.id)
                        }}
                        className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground"
                      >
                        <Check size={14} />
                      </button>
                    )}
                    <button
                      title="Delete notification"
                      onClick={(e) => {
                        e.stopPropagation()
                        deleteMutation.mutate(item.id)
                      }}
                      className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="p-3 border-t border-border bg-muted/20 text-center">
            <button
              onClick={() => {
                setIsOpen(false)
                navigate('/my-applications')
              }}
              className="text-xs text-muted-foreground hover:text-foreground font-medium transition-colors cursor-pointer"
            >
              View My Applications &rarr;
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
