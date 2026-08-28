import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import {
  LayoutGrid,
  User,
  FileText,
  ClipboardList,
  Search,
  Settings,
  LogOut,
  Bell,
  Briefcase,
  MoreVertical,
} from 'lucide-react'
import { useAuthStore } from '@/stores/auth'

type ApplicationStatus = 'Applied' | 'Shortlisted' | 'Interview Scheduled' | 'Rejected'

interface Application {
  id: number
  jobTitle: string
  company: string
  location: string
  salary: string
  postedAgo: string
  status: ApplicationStatus
}

const applications: Application[] = [
  { id: 1, jobTitle: 'Senior Frontend Developer', company: 'Ethiopian Airlines', location: 'Addis Ababa, ET', salary: '45,000 - 55,000 ETB', postedAgo: '2 days ago', status: 'Applied' },
  { id: 2, jobTitle: 'Full Stack Developer', company: 'Dashen Bank', location: 'Addis Ababa, ET', salary: '38,000 - 48,000 ETB', postedAgo: '5 days ago', status: 'Shortlisted' },
  { id: 3, jobTitle: 'React Developer', company: 'Commercial Bank of Ethiopia', location: 'Addis Ababa, ET', salary: '40,000 - 50,000 ETB', postedAgo: '1 week ago', status: 'Interview Scheduled' },
  { id: 4, jobTitle: 'UI Developer', company: 'Ethio Telecom', location: 'Addis Ababa, ET', salary: '35,000 - 45,000 ETB', postedAgo: '2 weeks ago', status: 'Rejected' },
  { id: 5, jobTitle: 'Frontend Engineer', company: 'Awash Bank', location: 'Addis Ababa, ET', salary: '37,000 - 44,000 ETB', postedAgo: '3 days ago', status: 'Applied' },
]

const tabs = [
  { label: 'All', count: applications.length },
  { label: 'Applied', count: applications.filter((a) => a.status === 'Applied').length },
  { label: 'Shortlisted', count: applications.filter((a) => a.status === 'Shortlisted').length },
  { label: 'Interview', count: applications.filter((a) => a.status === 'Interview Scheduled').length },
  { label: 'Rejected', count: applications.filter((a) => a.status === 'Rejected').length },
]

const statusStyles: Record<ApplicationStatus, string> = {
  Applied: 'bg-blue-50 text-blue-600',
  Shortlisted: 'bg-green-50 text-green-600',
  'Interview Scheduled': 'bg-amber-50 text-amber-600',
  Rejected: 'bg-red-50 text-red-600',
}

const navItems = [
  { label: 'Dashboard', icon: LayoutGrid, path: '/dashboard' },
  { label: 'My Profile', icon: User, path: '/my-profile' },
  { label: 'Applications', icon: FileText, path: '/my-applications' },
  { label: 'CV/Resume', icon: ClipboardList, path: '/cv-resume' },
  { label: 'Job Search', icon: Search, path: '/job-search' },
  { label: 'Settings', icon: Settings, path: '/settings' },
]

export default function MyApplicationsPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { user, logout } = useAuthStore()
  const [activeTab, setActiveTab] = useState('Applied')

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  const filteredApplications =
    activeTab === 'All'
      ? applications
      : applications.filter((app) =>
          activeTab === 'Interview' ? app.status === 'Interview Scheduled' : app.status === activeTab
        )

  return (
    <div className="min-h-screen flex bg-muted/30">
      <aside className="w-64 bg-background border-r flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-2 px-6 py-5">
            <div className="h-8 w-8 rounded-md bg-blue-600 flex items-center justify-center">
              <Briefcase className="h-4 w-4 text-white" />
            </div>
            <span className="font-semibold text-lg">HireStream</span>
          </div>

          <nav className="px-3 mt-2 space-y-1">
            {navItems.map((item) => {
              const isActive = item.label === 'Applications'
              const Icon = item.icon
              return (
                <button
                  key={item.label}
                  onClick={() => navigate(item.path)}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm ${
                    isActive
                      ? 'bg-blue-50 text-blue-600 font-medium'
                      : 'text-muted-foreground hover:bg-muted'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </button>
              )
            })}
          </nav>
        </div>

        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-6 py-4 text-sm text-muted-foreground hover:text-foreground"
        >
          <LogOut className="h-4 w-4" />
          {t('auth.logout')}
        </button>
      </aside>

      <div className="flex-1">
        <header className="flex items-center justify-between px-8 py-5 border-b bg-background">
          <h1 className="text-xl font-semibold">My Applications</h1>
          <div className="flex items-center gap-6">
            <div className="relative">
              <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search jobs..."
                className="pl-9 pr-3 py-2 text-sm rounded-md border bg-muted/40 focus:outline-none"
              />
            </div>
            <Bell className="h-5 w-5 text-muted-foreground" />
            <div className="flex items-center gap-2">
              <div className="h-9 w-9 rounded-full bg-muted overflow-hidden flex items-center justify-center text-sm font-medium">
                {user?.name?.[0] ?? 'U'}
              </div>
              <div className="text-sm">
                <p className="font-medium leading-tight">{user?.name ?? 'User'}</p>
                <p className="text-muted-foreground text-xs leading-tight">Addis Ababa, ET</p>
              </div>
            </div>
          </div>
        </header>

        <main className="px-8 py-6">
          <div className="flex items-center gap-3 mb-6">
            {tabs.map((tab) => {
              const isActive = tab.label === activeTab
              return (
                <button
                  key={tab.label}
                  onClick={() => setActiveTab(tab.label)}
                  className={`px-4 py-2 rounded-full text-sm border ${
                    isActive
                      ? 'bg-green-500 text-white border-green-500'
                      : 'bg-background text-foreground border-border hover:bg-muted'
                  }`}
                >
                  {tab.label} ({tab.count})
                </button>
              )
            })}
          </div>

          <div className="space-y-4">
            {filteredApplications.map((app) => (
              <div
                key={app.id}
                className="flex items-center justify-between bg-background border rounded-lg px-5 py-4"
              >
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-md bg-blue-50 flex items-center justify-center">
                    <Briefcase className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium">{app.jobTitle}</p>
                    <p className="text-sm text-muted-foreground">
                      {app.company} &nbsp;•&nbsp; {app.location} &nbsp;•&nbsp; {app.salary}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  <span className="text-sm text-muted-foreground">{app.postedAgo}</span>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold uppercase ${statusStyles[app.status]}`}
                  >
                    {app.status}
                  </span>
                  <button className="text-muted-foreground hover:text-foreground">
                    <MoreVertical className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>
    </div>
  )
}