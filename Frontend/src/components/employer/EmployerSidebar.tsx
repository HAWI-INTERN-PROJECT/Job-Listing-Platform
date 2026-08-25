import {
  LayoutDashboard,
  Building2,
  Briefcase,
  Users,
  Settings,
  LogOut,
} from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'

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

  return (
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
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
        >
          <LogOut className="h-5 w-5" />
          Logout
        </button>
      </nav>
    </aside>
  )
}