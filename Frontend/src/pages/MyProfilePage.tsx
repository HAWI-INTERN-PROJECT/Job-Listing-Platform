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
  MapPin,
  Mail,
} from 'lucide-react'
import { useAuthStore } from '@/stores/auth'

const navItems = [
  { label: 'Dashboard', icon: LayoutGrid, path: '/dashboard' },
  { label: 'My Profile', icon: User, path: '/my-profile' },
  { label: 'Applications', icon: FileText, path: '/my-applications' },
  { label: 'CV/Resume', icon: ClipboardList, path: '/cv-resume' },
  { label: 'Job Search', icon: Search, path: '/job-search' },
  { label: 'Settings', icon: Settings, path: '/settings' },
]

const skills = ['React', 'TypeScript', 'Next.js', 'Tailwind CSS', 'Node.js', 'Git', 'Figma', 'REST APIs']

const workExperience = [
  {
    title: 'Frontend Developer',
    company: 'Ethio Telecom - Full-time',
    period: 'Jun 2022 - Present (1 year 8 months)',
  },
  {
    title: 'Frontend Intern',
    company: 'Dashen Bank - Internship',
    period: 'Jan 2022 - May 2022 (5 months)',
  },
]

const languages = [
  { name: 'Amharic', level: 'Native' },
  { name: 'English', level: 'Fluent' },
  { name: 'Oromo', level: 'Conversational' },
]

export default function MyProfilePage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { user, logout } = useAuthStore()

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

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
              const isActive = item.label === 'My Profile'
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
          <h1 className="text-xl font-semibold">My Profile</h1>
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

        <main className="px-8 py-6 grid grid-cols-3 gap-6">
          {/* Left column (wide) */}
          <div className="col-span-2 space-y-6">
            <div className="bg-background border rounded-lg p-5 flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 rounded-full bg-muted overflow-hidden flex items-center justify-center text-lg font-medium">
                  {user?.name?.[0] ?? 'U'}
                </div>
                <div>
                  <h2 className="text-lg font-semibold">{user?.name ?? 'Your Name'}</h2>
                  <p className="text-sm text-muted-foreground">Frontend Developer</p>
                  <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5" /> Bole, Addis Ababa, Ethiopia
                    </span>
                    <span className="flex items-center gap-1">
                      <Mail className="h-3.5 w-3.5" /> {user?.email}
                    </span>
                  </div>
                </div>
              </div>
              <button className="bg-green-500 hover:bg-green-600 text-white text-sm font-medium px-4 py-2 rounded-md">
                Edit Profile
              </button>
            </div>

            <div className="bg-background border rounded-lg p-5">
              <h3 className="font-semibold mb-2">About</h3>
              <p className="text-sm text-muted-foreground">
                Passionate Frontend Developer with 2+ years of professional experience building
                high-performance web applications. Focused on creating intuitive user experiences
                and clean, maintainable React and Next.js architectures.
              </p>
            </div>

            <div className="bg-background border rounded-lg p-5">
              <h3 className="font-semibold mb-4">Work Experience</h3>
              <div className="space-y-4">
                {workExperience.map((job, index) => (
                  <div
                    key={job.title}
                    className={`flex items-start gap-3 ${
                      index !== workExperience.length - 1 ? 'pb-4 border-b' : ''
                    }`}
                  >
                    <div className="h-9 w-9 rounded-md bg-blue-50 flex items-center justify-center shrink-0">
                      <Briefcase className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">{job.title}</p>
                      <p className="text-sm text-muted-foreground">{job.company}</p>
                      <p className="text-xs text-muted-foreground">{job.period}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right column (narrow) */}
          <div className="space-y-6">
            <div className="bg-background border rounded-lg p-5">
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-semibold text-sm">Profile Completion</h3>
                <span className="text-green-600 text-sm font-semibold">85%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-muted overflow-hidden">
                <div className="h-full bg-green-500" style={{ width: '85%' }} />
              </div>
              <p className="text-xs text-muted-foreground mt-2">Add certificates to reach 100%</p>
            </div>

            <div className="bg-background border rounded-lg p-5">
              <h3 className="font-semibold text-sm mb-3">Skills</h3>
              <div className="flex flex-wrap gap-2">
                {skills.map((skill) => (
                  <span
                    key={skill}
                    className="text-xs bg-muted px-3 py-1 rounded-full text-foreground"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            <div className="bg-background border rounded-lg p-5">
              <h3 className="font-semibold text-sm mb-2">Education</h3>
              <p className="text-sm font-medium">BSc in Computer Science</p>
              <p className="text-sm text-muted-foreground">Addis Ababa University</p>
              <p className="text-xs text-muted-foreground">Graduated 2022</p>
            </div>

            <div className="bg-background border rounded-lg p-5">
              <h3 className="font-semibold text-sm mb-3">Languages</h3>
              <div className="space-y-2">
                {languages.map((lang) => (
                  <div key={lang.name} className="flex justify-between text-sm">
                    <span className="font-medium">{lang.name}</span>
                    <span className="text-muted-foreground">{lang.level}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}