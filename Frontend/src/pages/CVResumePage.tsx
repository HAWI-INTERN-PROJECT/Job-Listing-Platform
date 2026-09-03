import { useEffect, useRef, useState } from 'react'
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
  UploadCloud,
  CheckCircle2,
  AlertTriangle,
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

const MAX_SIZE_MB = 2

interface ActiveCV {
  name: string
  uploadedAt: string
  size: string
}

export default function CVResumePage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const location = useLocation()
  const { user, logout } = useAuthStore()

  const [activeCV, setActiveCV] = useState<ActiveCV | null>({
    name: 'Lidiya_Getachew_CV.pdf',
    uploadedAt: 'Aug 15, 2026',
    size: '245 KB',
  })
  const [uploadState, setUploadState] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle')
  const [progress, setProgress] = useState(0)
  const [errorTitle, setErrorTitle] = useState('')
  const [errorHint, setErrorHint] = useState('')
  const [dragActive, setDragActive] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const timerRef = useRef<number | null>(null)

  useEffect(() => {
    return () => {
      if (timerRef.current !== null) {
        window.clearInterval(timerRef.current)
      }
    }
  }, [])

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  const formatSize = (bytes: number): string => {
    if (bytes >= 1024 * 1024) {
      return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
    }
    return `${Math.max(1, Math.round(bytes / 1024))} KB`
  }

  const startUpload = (file: File) => {
    setUploadState('uploading')
    setProgress(0)
    let current = 0
    timerRef.current = window.setInterval(() => {
      current += 10
      setProgress(current)
      if (current >= 100) {
        if (timerRef.current !== null) {
          window.clearInterval(timerRef.current)
          timerRef.current = null
        }
        setUploadState('success')
        setActiveCV({
          name: file.name,
          uploadedAt: new Date().toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          }),
          size: formatSize(file.size),
        })
      }
    }, 120)
  }

  const handleFile = (file: File | undefined) => {
    if (!file) {
      return
    }

    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      setUploadState('error')
      setErrorTitle('Only PDF files are allowed')
      setErrorHint('Please upload a PDF document')
      return
    }

    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      setUploadState('error')
      setErrorTitle('File size exceeds 2MB limit')
      setErrorHint('Please compress your document')
      return
    }

    startUpload(file)
  }

  const handleDelete = () => {
    if (window.confirm('Delete this CV? This cannot be undone.')) {
      setActiveCV(null)
    }
  }

  const handleView = () => {
    alert('View is pending API integration')
  }

  const handleDownload = () => {
    alert('Download is pending API integration')
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
                item.path === location.pathname ||
                (item.path === '/my-profile' && location.pathname === '/edit-profile')
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
          <h1 className="text-xl font-semibold">CV/Resume Management</h1>
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

        <main className="px-8 py-6 grid grid-cols-3 gap-6 items-start">
          <div className="col-span-2 space-y-6">
            {activeCV && (
              <div className="bg-background border rounded-lg p-6">
                <h2 className="font-semibold text-base mb-4">Active CV/Resume</h2>
                <div className="flex items-center justify-between gap-3 bg-muted/40 border rounded-md p-3">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-md bg-red-100 flex items-center justify-center">
                      <FileText className="h-5 w-5 text-red-500" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold">{activeCV.name}</p>
                      <p className="text-xs text-muted-foreground">
                        Uploaded {activeCV.uploadedAt} • {activeCV.size}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleView}
                      className="px-3 py-1.5 text-xs font-medium border rounded-md hover:bg-muted"
                    >
                      View
                    </button>
                    <button
                      onClick={handleDownload}
                      className="px-3 py-1.5 text-xs font-medium border rounded-md hover:bg-muted"
                    >
                      Download
                    </button>
                    <button
                      onClick={handleDelete}
                      className="px-3 py-1.5 text-xs font-medium rounded-md bg-red-100 text-red-600 hover:bg-red-200"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            )}

            <div
              onClick={() => inputRef.current?.click()}
              onDragOver={(e) => {
                e.preventDefault()
                setDragActive(true)
              }}
              onDragLeave={() => setDragActive(false)}
              onDrop={(e) => {
                e.preventDefault()
                setDragActive(false)
                handleFile(e.dataTransfer.files[0])
              }}
              className={`border-2 border-dashed rounded-lg p-10 flex flex-col items-center justify-center text-center cursor-pointer ${
                dragActive ? 'border-blue-700 bg-blue-50' : 'border-blue-500'
              }`}
            >
              <div className="h-14 w-14 rounded-full bg-blue-100 flex items-center justify-center mb-4">
                <UploadCloud className="h-6 w-6 text-blue-600" />
              </div>
              <p className="text-sm font-semibold">Drag and drop your CV here</p>
              <p className="text-sm text-muted-foreground">or click to browse your files</p>
              <p className="text-xs text-muted-foreground mt-3">Supported format: PDF (Max 2MB)</p>
              <input
                ref={inputRef}
                type="file"
                accept="application/pdf,.pdf"
                className="hidden"
                data-testid="cv-input"
                onChange={(e) => {
                  handleFile(e.target.files?.[0])
                  e.target.value = ''
                }}
              />
            </div>

            {uploadState === 'uploading' && (
              <div className="bg-background border rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <FileText className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="text-sm font-semibold">Uploading your CV...</p>
                    <p className="text-xs text-muted-foreground">Uploading ({progress}%)</p>
                  </div>
                </div>
                <div className="h-1.5 bg-muted rounded-full mt-3">
                  <div
                    className="h-1.5 bg-blue-600 rounded-full"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            )}

            {uploadState === 'success' && (
              <div className="border border-green-600 bg-green-50 rounded-lg p-4 flex items-center gap-3">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
                <div>
                  <p className="text-sm font-semibold text-green-700">CV uploaded successfully</p>
                  <p className="text-xs text-green-600">Ready to be used for applications</p>
                </div>
              </div>
            )}

            {uploadState === 'error' && (
              <div className="border border-red-600 bg-red-50 rounded-lg p-4 flex items-center gap-3">
                <AlertTriangle className="h-5 w-5 text-red-600" />
                <div>
                  <p className="text-sm font-semibold text-red-700">{errorTitle}</p>
                  <p className="text-xs text-red-600">{errorHint}</p>
                </div>
              </div>
            )}
          </div>

          <div>
            <h2 className="font-semibold text-base mb-4">Upload Status Examples</h2>
            <div className="space-y-4">
              <div className="bg-background border rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <FileText className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="text-sm font-semibold">Lidiya_Getachew_CV_updated.pdf</p>
                    <p className="text-xs text-muted-foreground">Uploading (60%)</p>
                  </div>
                </div>
                <div className="h-1.5 bg-muted rounded-full mt-3">
                  <div className="h-1.5 bg-blue-600 rounded-full w-3/5" />
                </div>
              </div>

              <div className="border border-green-600 bg-green-50 rounded-lg p-4 flex items-center gap-3">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
                <div>
                  <p className="text-sm font-semibold text-green-700">CV uploaded successfully</p>
                  <p className="text-xs text-green-600">Ready to be used for applications</p>
                </div>
              </div>

              <div className="border border-red-600 bg-red-50 rounded-lg p-4 flex items-center gap-3">
                <AlertTriangle className="h-5 w-5 text-red-600" />
                <div>
                  <p className="text-sm font-semibold text-red-700">File size exceeds 2MB limit</p>
                  <p className="text-xs text-red-600">Please compress your document</p>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}