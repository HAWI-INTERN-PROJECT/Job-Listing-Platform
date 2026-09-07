import { useEffect } from 'react'
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
  Star,
  Calendar,
  Bookmark,
  Clock,
  MapPin,
  ChevronRight,
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

interface RecommendedJob {
  id: number
  jobTitle: string
  company: string
  location: string
  salary: string
}

// Same data source as MyApplicationsPage.
// All numbers below are COUNTED from this list, never typed by hand.
const applications: Application[] = [
  { id: 1, jobTitle: 'Senior Frontend Developer', company: 'Ethiopian Airlines', location: 'Addis Ababa, ET', salary: '45,000 - 55,000 ETB', postedAgo: '2 days ago', status: 'Applied' },
  { id: 2, jobTitle: 'Full Stack Developer', company: 'Dashen Bank', location: 'Addis Ababa, ET', salary: '38,000 - 48,000 ETB', postedAgo: '5 days ago', status: 'Shortlisted' },
  { id: 3, jobTitle: 'React Developer', company: 'Commercial Bank of Ethiopia', location: 'Addis Ababa, ET', salary: '40,000 - 50,000 ETB', postedAgo: '1 week ago', status: 'Interview Scheduled' },
  { id: 4, jobTitle: 'UI Developer', company: 'Ethio Telecom', location: 'Addis Ababa, ET', salary: '35,000 - 45,000 ETB', postedAgo: '2 weeks ago', status: 'Rejected' },
  { id: 5, jobTitle: 'Frontend Engineer', company: 'Awash Bank', location: 'Addis Ababa, ET', salary: '37,000 - 44,000 ETB', postedAgo: '3 days ago', status: 'Applied' },
]

// Saved Jobs feature does not exist in the app yet, so the real count is 0.
const savedJobs: RecommendedJob[] = []

const recommendedJobs: RecommendedJob[] = [
  { id: 1, jobTitle: 'Senior React Developer', company: 'GlobalTech', location: 'Addis Ababa, ET', salary: '50,000 - 60,000 ETB' },
  { id: 2, jobTitle: 'Frontend Engineer', company: 'Innovate Inc', location: 'Remote', salary: '45,000 - 55,000 ETB' },
  { id: 3, jobTitle: 'UI Engineer', company: 'DesignHub', location: 'Addis Ababa, ET', salary: '40,000 - 50,000 ETB' },
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

export default function DashboardPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { user, getProfile, logout } = useAuthStore()

  useEffect(() => {
    if (!user) {
      getProfile().catch(() => {
        navigate('/login')
      })
    } else if (user.role === 'employer') {
      navigate('/employer-dashboard', { replace: true })
    }
  }, [user, getProfile, navigate])

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  const stats = [
    { label: 'Applications', value: applications.length, icon: FileText, styles: 'bg-blue-50 text-blue-600' },
    { label: 'Shortlisted', value: applications.filter((a) => a.status === 'Shortlisted').length, icon: Star, styles: 'bg-green-50 text-green-600' },
    { label: 'Interviews', value: applications.filter((a) => a.status === 'Interview Scheduled').length, icon: Calendar, styles: 'bg-amber-50 text-amber-600' },
    { label: 'Saved Jobs', value: savedJobs.length, icon: Bookmark, styles: 'bg-purple-50 text-purple-600' },
  ]

  const upcomingInterview = applications.find((a) => a.status === 'Interview Scheduled')
  const recentApplications = applications.slice(0, 3)

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
              const isActive = item.label === 'Dashboard'
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
          <h1 className="text-xl font-semibold">Dashboard</h1>
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

        <main className="px-8 py-6 space-y-6">
          <div>
            <h2 className="text-xl font-semibold">Welcome back, {user?.name ?? 'User'}</h2>
            <p className="text-sm text-muted-foreground mt-1">Here is an overview of your job search.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.map((stat) => {
              const Icon = stat.icon
              return (
                <div key={stat.label} className="bg-background border rounded-lg p-5 flex items-center gap-4">
                  <div className={`h-10 w-10 rounded-md flex items-center justify-center ${stat.styles}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-2xl font-semibold leading-tight">{stat.value}</p>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                  </div>
                </div>
              )
            })}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-background border rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold">Recent Applications</h3>
                <button
                  onClick={() => navigate('/my-applications')}
                  className="text-sm text-blue-600 hover:underline flex items-center gap-1"
                >
                  View all <ChevronRight className="h-4 w-4" />
                </button>
              </div>
              <div className="space-y-3">
                {recentApplications.map((app) => (
                  <div key={app.id} className="flex items-center justify-between border rounded-lg px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-md bg-blue-50 flex items-center justify-center">
                        <Briefcase className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium">{app.jobTitle}</p>
                        <p className="text-sm text-muted-foreground">
                          {app.company} • {app.postedAgo}
                        </p>
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold uppercase ${statusStyles[app.status]}`}>
                      {app.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-background border rounded-lg p-6">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Calendar className="h-4 w-4 text-amber-600" />
                Upcoming Interview
              </h3>
              {upcomingInterview ? (
                <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
                  <p className="font-medium">{upcomingInterview.jobTitle}</p>
                  <p className="text-sm text-muted-foreground mt-1">{upcomingInterview.company}</p>
                  <div className="flex items-center gap-2 mt-3 text-sm text-amber-700 font-medium">
                    <Clock className="h-4 w-4" />
                    Interview scheduled
                  </div>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No upcoming interviews.</p>
              )}
            </div>
          </div>

          <div className="bg-background border rounded-lg p-6">
            <h3 className="font-semibold mb-4">Recommended Jobs</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {recommendedJobs.map((job) => (
                <div key={job.id} className="border rounded-lg p-4 hover:border-blue-300 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="h-10 w-10 rounded-md bg-blue-50 flex items-center justify-center">
                      <Briefcase className="h-5 w-5 text-blue-600" />
                    </div>
                    <Bookmark className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <p className="font-medium mt-3">{job.jobTitle}</p>
                  <p className="text-sm text-muted-foreground">{job.company}</p>
                  <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                    <MapPin className="h-3 w-3" /> {job.location} • {job.salary}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}