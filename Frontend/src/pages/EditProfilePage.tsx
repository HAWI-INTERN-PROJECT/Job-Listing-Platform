import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate, useLocation } from 'react-router-dom'
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
  X,
  Plus,
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

const initialSkills = ['React', 'TypeScript', 'Next.js', 'Tailwind CSS', 'Node.js', 'Git', 'Figma']

export default function EditProfilePage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const location = useLocation()
  const { user, logout } = useAuthStore()

  const [formData, setFormData] = useState({
    fullName: user?.name ?? 'Lidiya Getachew',
    headline: 'Frontend Developer',
    email: user?.email ?? 'lidiya.getachew@gmail.com',
    phone: '+251 911 234 567',
    location: 'Bole, Addis Ababa, Ethiopia',
  })

  const [skills, setSkills] = useState<string[]>(initialSkills)
  const [newSkill, setNewSkill] = useState('')
  const [showSkillInput, setShowSkillInput] = useState(false)
  const [isDirty, setIsDirty] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  const removeSkill = (skill: string) => {
    setSkills(skills.filter((s) => s !== skill))
    setIsDirty(true)
  }

  const addSkill = () => {
    if (newSkill.trim() && !skills.includes(newSkill.trim())) {
      setSkills([...skills, newSkill.trim()])
      setNewSkill('')
      setIsDirty(true)
    }
  }

  const handleChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value })
    setIsDirty(true)

    if (errors[field]) {
      setErrors({ ...errors, [field]: '' })
    }
  }

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required'
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSave = () => {
    if (!validateForm()) {
      return
    }

    alert('Profile updated successfully! (API integration pending)')
    navigate('/my-profile')
  }

  const handleCancel = () => {
    if (isDirty) {
      const confirmed = window.confirm('You have unsaved changes. Are you sure you want to cancel?')
      if (!confirmed) {
        return
      }
    }
    navigate('/my-profile')
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
              const isActive =
                item.path === '/my-profile' &&
                (location.pathname === '/my-profile' || location.pathname === '/edit-profile')
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
          <h1 className="text-xl font-semibold">Edit Profile</h1>
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

        <main className="px-8 py-6 space-y-6 max-w-5xl">
          <div className="bg-background border rounded-lg p-6">
            <h2 className="font-semibold text-base mb-5">Personal Information</h2>
            <div className="grid grid-cols-2 gap-5">
              <div>
                <label className="text-sm font-medium block mb-1.5">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => handleChange('fullName', e.target.value)}
                  className={`w-full px-3 py-2 text-sm rounded-md border focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.fullName ? 'border-red-500' : ''
                  }`}
                />
                {errors.fullName && <p className="text-red-500 text-xs mt-1">{errors.fullName}</p>}
              </div>
              <div>
                <label className="text-sm font-medium block mb-1.5">Professional Headline</label>
                <input
                  type="text"
                  value={formData.headline}
                  onChange={(e) => handleChange('headline', e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-md border focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="text-sm font-medium block mb-1.5">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  className={`w-full px-3 py-2 text-sm rounded-md border focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.email ? 'border-red-500' : ''
                  }`}
                />
                {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
              </div>
              <div>
                <label className="text-sm font-medium block mb-1.5">Phone Number</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleChange('phone', e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-md border focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="text-sm font-medium block mb-1.5">Location</label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => handleChange('location', e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-md border focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          <div className="bg-background border rounded-lg p-6">
            <h2 className="font-semibold text-base mb-5">Skills</h2>
            <div className="flex flex-wrap items-center gap-2">
              {skills.map((skill) => (
                <span
                  key={skill}
                  className="inline-flex items-center gap-1.5 text-sm bg-muted px-3 py-1 rounded-full"
                >
                  {skill}
                  <button
                    onClick={() => removeSkill(skill)}
                    className="hover:text-red-600"
                    aria-label={`Remove ${skill}`}
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </span>
              ))}
              {showSkillInput && (
                <input
                  autoFocus
                  type="text"
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      addSkill()
                      setShowSkillInput(false)
                    }
                    if (e.key === 'Escape') {
                      setNewSkill('')
                      setShowSkillInput(false)
                    }
                  }}
                  placeholder="Skill"
                  className="w-28 px-3 py-1 text-sm rounded-md border focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              )}
              <button
                onClick={() => setShowSkillInput(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1 text-sm border border-dashed border-green-500 text-green-600 rounded-full hover:bg-green-50"
              >
                <Plus className="h-3.5 w-3.5" />
                Add Skill
              </button>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3">
            <button
              onClick={handleCancel}
              className="px-5 py-2 text-sm font-medium rounded-md border hover:bg-muted"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-5 py-2 text-sm font-medium rounded-md bg-green-500 text-white hover:bg-green-600"
            >
              Save Changes
            </button>
          </div>
        </main>
      </div>
    </div>
  )
}