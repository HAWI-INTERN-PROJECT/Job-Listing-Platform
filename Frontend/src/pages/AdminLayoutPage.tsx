import { NavLink, Outlet } from 'react-router-dom'
import {
  LayoutDashboard,
  Users,
  BriefcaseBusiness,
  FileText,
  Building2,
  Settings,
  LogOut,
  Search,
  Bell,
} from 'lucide-react'

const navItems = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/admin/jobs', label: 'Job Management', icon: BriefcaseBusiness },
  { to: '/admin/users', label: 'Users', icon: Users },
  { to: '/admin/applications', label: 'Applications', icon: FileText },
  { to: '/admin/companies', label: 'Companies', icon: Building2 },
  { to: '/admin/settings', label: 'Settings', icon: Settings },
]

export default function AdminLayout() {
  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-950 text-white min-h-screen hidden md:flex flex-col">
        <div className="h-20 flex items-center px-6 border-b border-slate-800">
          <div>
            <h1 className="text-xl font-bold">Lidiya Job Seeker</h1>
            <p className="text-xs text-slate-400 mt-1">ADMIN PORTAL</p>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          {navItems.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-300 hover:bg-slate-800'
                }`
              }
            >
              <Icon size={20} />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-800">
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-slate-300 hover:bg-slate-800">
            <LogOut size={20} />
            Logout
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 min-w-0">
        <header className="h-20 bg-white border-b flex items-center justify-between px-6">
          <div>
            <h2 className="text-2xl font-semibold text-slate-900">Admin</h2>
            <p className="text-sm text-slate-500">Welcome back, Admin</p>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-2 border rounded-lg px-3 py-2">
              <Search size={18} className="text-slate-400" />
              <input type="text" placeholder="Search..." className="outline-none text-sm w-32" />
            </div>

            <button className="relative p-2">
              <Bell size={21} />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
            </button>

            <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-semibold">
              L
            </div>
          </div>
        </header>

        {/* Whichever admin page matched the URL renders here */}
        <div className="p-6">
          <Outlet />
        </div>
      </main>
    </div>
  )
}