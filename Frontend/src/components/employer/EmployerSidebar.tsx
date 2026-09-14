import { LayoutDashboard, Building2, Briefcase, Users, Settings, LogOut, Menu, X } from 'lucide-react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { useAuthStore } from '@/stores/auth'
import { Button } from '@/components/ui/button'

const navItems = [
  { label: 'Dashboard',       icon: LayoutDashboard, path: '/employer-dashboard' },
  { label: 'Company Profile', icon: Building2,        path: '/company-profile' },
  { label: 'My Job Posts',    icon: Briefcase,        path: '/my-job-posts' },
  { label: 'Applicants',      icon: Users,            path: '/job-applicants' },
  { label: 'Settings',        icon: Settings,         path: '/settings' },
]

function NavList({ collapsed, onNavigate }: { collapsed?: boolean; onNavigate?: () => void }) {
  const location = useLocation()
  const navigate = useNavigate()
  const { logout } = useAuthStore()
  const [showConfirm, setShowConfirm] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  async function handleLogout() {
    setIsLoggingOut(true)
    try { await logout(); navigate('/login', { replace: true }) }
    catch { navigate('/login', { replace: true }) }
    finally { setIsLoggingOut(false); setShowConfirm(false) }
  }

  function go(path: string) { navigate(path); onNavigate?.() }

  return (
    <>
      <nav className="flex-1 space-y-1 p-2 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = location.pathname === item.path
          return (
            <button
              key={item.label}
              onClick={() => go(item.path)}
              title={collapsed ? item.label : undefined}
              className={`w-full flex items-center rounded-lg px-3 py-2 text-xs font-medium transition-colors ${
                collapsed ? 'justify-center' : 'gap-3'
              } ${
                isActive
                  ? 'bg-sidebar-accent text-sidebar-accent-foreground font-semibold shadow-2xs'
                  : 'text-sidebar-foreground/75 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground'
              }`}
            >
              <Icon className="h-4 w-4 flex-shrink-0" />
              {!collapsed && item.label}
            </button>
          )
        })}
      </nav>

      <div className="p-2 border-t border-sidebar-border/70">
        <button
          onClick={() => setShowConfirm(true)}
          title={collapsed ? 'Logout' : undefined}
          className={`flex w-full items-center rounded-lg px-3 py-2 text-xs font-medium text-sidebar-foreground/75 hover:bg-sidebar-accent/60 hover:text-rose-600 dark:hover:text-rose-400 transition-colors ${
            collapsed ? 'justify-center' : 'gap-3'
          }`}
        >
          <LogOut className="h-4 w-4 flex-shrink-0" />
          {!collapsed && 'Logout'}
        </button>
      </div>

      {showConfirm && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-[2px] p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-sm rounded-xl bg-card border border-border p-6 shadow-2xl space-y-4 text-foreground">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-rose-500/10 p-3 text-rose-600 dark:text-rose-400">
                <LogOut className="h-5 w-5" />
              </div>
              <div>
                <h2 className="font-semibold text-foreground text-sm">Sign Out</h2>
                <p className="text-xs text-muted-foreground mt-0.5">Are you sure you want to sign out?</p>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2 border-t border-border/60">
              <Button variant="outline" size="sm" onClick={() => setShowConfirm(false)} disabled={isLoggingOut} className="text-xs">
                Cancel
              </Button>
              <Button variant="destructive" size="sm" onClick={handleLogout} disabled={isLoggingOut} className="text-xs">
                {isLoggingOut ? 'Signing out...' : 'Sign Out'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default function EmployerSidebar() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [collapsed, setCollapsed] = useState(false)

  return (
    <>
      {/* Mobile top bar */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-40 flex h-14 items-center justify-between border-b border-border/60 bg-background/95 backdrop-blur px-4">
        <div className="flex items-center gap-2.5">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-sidebar-primary text-sidebar-primary-foreground font-bold text-xs">
            H
          </div>
          <div className="flex items-center gap-1.5">
            <span className="font-semibold text-sm tracking-tight text-foreground">HireStream</span>
            <span className="text-[10px] uppercase font-semibold px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
              Employer
            </span>
          </div>
        </div>
        <button
          onClick={() => setMobileOpen(true)}
          className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/70 transition-colors"
          aria-label="Open menu"
        >
          <Menu className="h-4 w-4" />
        </button>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-[2px] transition-opacity"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="relative w-64 bg-sidebar-background border-r border-sidebar-border flex flex-col h-full shadow-xl animate-in slide-in-from-left duration-200">
            <div className="flex h-14 items-center justify-between border-b border-sidebar-border/70 px-4">
              <div className="flex items-center gap-2.5">
                <div className="flex h-7 w-7 items-center justify-center rounded-md bg-sidebar-primary text-sidebar-primary-foreground font-bold text-xs">
                  H
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="font-semibold text-sm tracking-tight text-sidebar-foreground">HireStream</span>
                  <span className="text-[10px] uppercase font-semibold px-1.5 py-0.5 rounded bg-sidebar-accent text-sidebar-foreground">
                    Employer
                  </span>
                </div>
              </div>
              <button
                onClick={() => setMobileOpen(false)}
                className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-sidebar-accent transition-colors"
                aria-label="Close menu"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <NavList onNavigate={() => setMobileOpen(false)} />
          </aside>
        </div>
      )}

      {/* Desktop sticky sidebar */}
      <aside className={`hidden md:flex flex-col flex-shrink-0 border-r border-sidebar-border bg-sidebar-background sticky top-0 h-screen transition-all duration-300 ${collapsed ? 'w-16' : 'w-64'}`}>
        <div className="flex h-16 items-center border-b border-sidebar-border/70 px-3 flex-shrink-0">
          <button
            onClick={() => setCollapsed((v) => !v)}
            className="flex items-center gap-2.5 overflow-hidden rounded-md hover:opacity-80 transition-opacity w-full text-left"
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-sidebar-primary text-sidebar-primary-foreground font-bold text-xs flex-shrink-0">
              H
            </div>
            {!collapsed && (
              <div className="flex items-center gap-1.5 min-w-0">
                <span className="font-semibold text-sm tracking-tight text-sidebar-foreground truncate">HireStream</span>
                <span className="text-[10px] uppercase font-semibold px-1.5 py-0.5 rounded bg-sidebar-accent text-sidebar-foreground flex-shrink-0">
                  Employer
                </span>
              </div>
            )}
          </button>
        </div>
        <NavList collapsed={collapsed} />
      </aside>
    </>
  )
}
