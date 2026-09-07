import { useState, useRef, useEffect } from 'react'
import { Bell, User, Settings, LogOut, ChevronDown } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/stores/auth'
import { ThemeToggle } from '@/components/ThemeToggle'
import { LanguageSwitcher } from '@/components/LanguageSwitcher'

interface EmployerHeaderProps {
  title: string
}

function getInitials(name?: string): string {
  if (!name) return 'U'
  const parts = name.trim().split(' ')
  if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase()
  return name.slice(0, 2).toUpperCase()
}

export default function EmployerHeader({ title }: EmployerHeaderProps) {
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const handleLogout = async () => {
    setOpen(false)
    await logout()
    navigate('/login', { replace: true })
  }

  const isEmployee = user?.role === 'employee'

  return (
    <header className="flex h-16 items-center justify-between border-b bg-background px-4 sm:px-6 flex-shrink-0 sticky top-0 z-30">
      <h1 className="text-xl font-semibold">{title}</h1>

      <div className="flex items-center gap-3">
        <LanguageSwitcher />
        <ThemeToggle />
        <button
          type="button"
          className="rounded-full p-2 hover:bg-muted text-muted-foreground hover:text-foreground"
          aria-label="Notifications"
        >
          <Bell className="h-5 w-5" />
        </button>

        <div className="relative" ref={ref}>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="flex items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-muted transition-colors"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-sm font-semibold text-white flex-shrink-0">
              {getInitials(user?.name)}
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-sm font-medium leading-tight">{user?.name ?? 'User'}</p>
              <p className="text-xs text-muted-foreground capitalize leading-tight">
                {user?.role_label ?? user?.role ?? 'Guest'}
              </p>
            </div>
            <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${open ? 'rotate-180' : ''}`} />
          </button>

          {open && (
            <div className="absolute right-0 top-full mt-1 w-48 rounded-lg border bg-background shadow-lg z-50 py-1">
              <div className="px-3 py-2 border-b">
                <p className="text-sm font-medium truncate">{user?.name}</p>
                <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
              </div>

              {isEmployee && (
                <button
                  onClick={() => { setOpen(false); navigate('/my-profile') }}
                  className="flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-muted text-left"
                >
                  <User className="h-4 w-4 text-muted-foreground" />
                  My Profile
                </button>
              )}

              <button
                onClick={() => { setOpen(false); navigate('/settings') }}
                className="flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-muted text-left"
              >
                <Settings className="h-4 w-4 text-muted-foreground" />
                Settings
              </button>

              <div className="border-t mt-1 pt-1">
                <button
                  onClick={handleLogout}
                  className="flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-muted text-red-600 text-left"
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
