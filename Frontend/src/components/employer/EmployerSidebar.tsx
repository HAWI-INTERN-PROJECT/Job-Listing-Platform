
import {
  LayoutDashboard,
  Building2,
  Briefcase,
  Users,
  Settings,
  LogOut,
} from 'lucide-react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useState } from 'react'

import { useAuthStore } from '@/stores/auth'
import { Button } from '@/components/ui/button'

const navigation = [
  {
    name: 'Dashboard',
    href: '/employer-dashboard',
    icon: LayoutDashboard,
  },
  {
    name: 'Company Profile',
    href: '/company-profile',
    icon: Building2,
  },
  {
    name: 'My Job Posts',
    href: '/my-job-posts',
    icon: Briefcase,
  },
  {
    name: 'Applicants',
    href: '/job-applicants',
    icon: Users,
  },
  {
    name: 'Settings',
    href: '/settings',
    icon: Settings,
  },
]

export default function EmployerSidebar() {
  const location = useLocation()
  const navigate = useNavigate()

  const logout = useAuthStore((state) => state.logout)

  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  async function handleLogout() {
    try {
      setIsLoggingOut(true)

      await logout()

      navigate('/login', { replace: true })
    } catch (error) {
      console.error('Logout failed:', error)

      navigate('/login', { replace: true })
    } finally {
      setIsLoggingOut(false)
      setShowLogoutConfirm(false)
    }
  }

  return (
    <>
      <aside className="hidden min-h-screen w-64 border-r bg-background md:block">
        <div className="flex h-16 items-center border-b px-6">
          <h2 className="text-lg font-bold">Job Listing Platform</h2>
        </div>

        <nav className="space-y-1 p-4">
          {navigation.map((item) => {
            const Icon = item.icon
            const isActive = location.pathname === item.href

            return (
              <Link
                key={item.name}
                to={item.href}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium ${
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                }`}
              >
                <Icon className="h-5 w-5" />
                {item.name}
              </Link>
            )
          })}

          <button
            type="button"
            onClick={() => setShowLogoutConfirm(true)}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <LogOut className="h-5 w-5" />
            Logout
          </button>
        </nav>
      </aside>

      {showLogoutConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-xl bg-background p-6 shadow-lg">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-red-100 p-3">
                <LogOut className="h-6 w-6 text-red-600" />
              </div>

              <div>
                <h2 className="text-lg font-semibold">
                  Logout
                </h2>

                <p className="text-sm text-muted-foreground">
                  Are you sure you want to logout?
                </p>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowLogoutConfirm(false)}
                disabled={isLoggingOut}
              >
                Cancel
              </Button>

              <Button
                type="button"
                variant="destructive"
                onClick={handleLogout}
                disabled={isLoggingOut}
              >
                {isLoggingOut ? 'Logging out...' : 'Logout'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

