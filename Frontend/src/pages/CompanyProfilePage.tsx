import { useEffect, useRef, useState } from 'react'
import {
  AlertCircle,
  Building2,
  Camera,
  CheckCircle,
  Clock,
  Loader2,
  Mail,
  MapPin,
  Phone,
  Save,
  X,
  XCircle,
} from 'lucide-react'

import EmployerSidebar from '@/components/employer/EmployerSidebar'
import EmployerHeader from '@/components/employer/EmployerHeader'

import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import api from '@/lib/api'

type CompanyProfile = {
  companyName: string
  email: string
  phone: string
  location: string
  website: string
  industry: string
  companySize: string
  description: string
}

const defaultProfile: CompanyProfile = {
  companyName: '',
  email: '',
  phone: '',
  location: '',
  website: '',
  industry: 'Technology',
  companySize: '51–200 employees',
  description: '',
}

export default function CompanyProfilePage() {
  const [profile, setProfile] = useState<CompanyProfile>(defaultProfile)
  const [savedProfile, setSavedProfile] = useState<CompanyProfile>(defaultProfile)
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [logoPreview, setLogoPreview] = useState<string | null>(null)
  const [approvalStatus, setApprovalStatus] = useState<string>('pending')

  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')

  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    fetchCompanyProfile()
  }, [])

  async function fetchCompanyProfile() {
    try {
      setIsLoading(true)
      const res = await api.get('/employer/profile')

      if (res.data.success && res.data.data) {
        const data = res.data.data
        const loaded: CompanyProfile = {
          companyName: data.company_name || '',
          email: data.email || data.user?.email || '',
          phone: data.phone || '',
          location: data.location || '',
          website: data.website || '',
          industry: data.industry || 'Technology',
          companySize: data.company_size || '51–200 employees',
          description: data.description || '',
        }
        setProfile(loaded)
        setSavedProfile(loaded)
        setApprovalStatus(data.approval_status || 'pending')

        if (data.logo) {
          setLogoPreview(data.logo.startsWith('http') ? data.logo : `/storage/${data.logo}`)
        }
      }
    } catch (err: any) {
      if (err.response?.status !== 404) {
        setErrorMessage('Failed to load company profile.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  function handleChange(
    event: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) {
    const { name, value } = event.target
    setProfile((current) => ({
      ...current,
      [name]: value,
    }))
  }

  function handleLogoChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) return

    setLogoFile(file)
    setLogoPreview(URL.createObjectURL(file))
    setMessage('')
    setErrorMessage('')
  }

  async function handleSave() {
    try {
      setIsSaving(true)
      setMessage('')
      setErrorMessage('')

      if (!profile.companyName.trim()) {
        setErrorMessage('Company name is required.')
        setIsSaving(false)
        return
      }

      const formData = new FormData()
      formData.append('company_name', profile.companyName)
      formData.append('email', profile.email)
      formData.append('phone', profile.phone)
      formData.append('location', profile.location)
      formData.append('website', profile.website)
      formData.append('industry', profile.industry)
      formData.append('company_size', profile.companySize)
      formData.append('description', profile.description)

      if (logoFile) {
        formData.append('logo', logoFile)
      }

      const res = await api.post('/employer/profile', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })

      if (res.data.success) {
        setSavedProfile({ ...profile })
        setMessage('Company profile saved successfully.')

        if (res.data.data?.logo) {
          const logoPath = res.data.data.logo
          setLogoPreview(logoPath.startsWith('http') ? logoPath : `/storage/${logoPath}`)
        }
        if (res.data.data?.approval_status) {
          setApprovalStatus(res.data.data.approval_status)
        }

        window.setTimeout(() => {
          setMessage('')
        }, 4000)
      }
    } catch (err: any) {
      const msg =
        err.response?.data?.message ||
        'Failed to save company profile. Please verify all inputs.'
      setErrorMessage(msg)
    } finally {
      setIsSaving(false)
    }
  }

  function handleCancel() {
    setProfile({ ...savedProfile })
    setMessage('Changes have been cancelled.')
    setErrorMessage('')
    window.setTimeout(() => {
      setMessage('')
    }, 3000)
  }

  function handleUploadClick() {
    fileInputRef.current?.click()
  }

  return (
    <div className="h-screen flex overflow-hidden bg-background">
      <EmployerSidebar />

      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto pt-14 md:pt-0">
        <EmployerHeader title="Company Profile" />

        <main className="w-full px-4 sm:px-6 lg:px-8 py-8 space-y-6">
          {/* Notion Document Header */}
          <div className="border-b border-border/60 pb-5 space-y-1.5">
            <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium">
              <span className="inline-flex items-center justify-center h-5 w-5 rounded bg-muted text-foreground text-[11px] font-semibold">
                🏢
              </span>
              <span>Organization / Company Profile</span>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-foreground">
                  Company Profile
                </h1>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Manage your organization identity, branding logo, contact information, and verification status.
                </p>
              </div>

              <span
                className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium self-start sm:self-auto ${
                  approvalStatus === 'approved'
                    ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                    : approvalStatus === 'rejected'
                    ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20'
                    : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
                }`}
              >
                {approvalStatus === 'approved' ? 'Verified Employer' : approvalStatus === 'rejected' ? 'Rejected' : 'Pending Verification'}
              </span>
            </div>
          </div>

          {isLoading ? (
            <div className="rounded-xl border border-border/70 bg-card flex flex-col items-center justify-center py-16">
              <Loader2 className="h-7 w-7 animate-spin text-muted-foreground mb-2" />
              <p className="text-xs text-muted-foreground">Loading company profile...</p>
            </div>
          ) : (
            <>
              {message && (
                <div className="flex items-center gap-2 rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-xs font-medium text-emerald-700 dark:text-emerald-400">
                  <CheckCircle className="h-4 w-4 flex-shrink-0" />
                  {message}
                </div>
              )}

              {errorMessage && (
                <div className="flex items-center gap-2 rounded-xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-xs font-medium text-rose-700 dark:text-rose-400">
                  <AlertCircle className="h-4 w-4 flex-shrink-0" />
                  {errorMessage}
                </div>
              )}

              {/* Company Banner & Logo Card */}
              <div className="rounded-xl border border-border/70 bg-card p-5 shadow-xs">
                <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
                  <div className="relative">
                    <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-xl border border-border/70 bg-muted text-foreground font-bold text-2xl">
                      {logoPreview ? (
                        <img
                          src={logoPreview}
                          alt="Company logo"
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <Building2 className="h-10 w-10 text-muted-foreground" />
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={handleUploadClick}
                      className="absolute -bottom-1.5 -right-1.5 flex h-7 w-7 items-center justify-center rounded-full border border-border bg-card text-foreground shadow-xs hover:bg-muted transition-colors"
                      title="Change company logo"
                    >
                      <Camera className="h-3.5 w-3.5" />
                    </button>

                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleLogoChange}
                      className="hidden"
                    />
                  </div>

                  <div className="flex-1 space-y-2">
                    <h2 className="text-lg font-bold text-foreground">
                      {profile.companyName || 'Your Company Name'}
                    </h2>

                    <div className="flex flex-col gap-2 text-xs text-muted-foreground sm:flex-row sm:flex-wrap sm:gap-4">
                      <div className="flex items-center gap-1.5">
                        <MapPin className="h-3.5 w-3.5" />
                        {profile.location || 'Location not set'}
                      </div>

                      <div className="flex items-center gap-1.5">
                        <Mail className="h-3.5 w-3.5" />
                        {profile.email || 'Email not set'}
                      </div>

                      <div className="flex items-center gap-1.5">
                        <Phone className="h-3.5 w-3.5" />
                        {profile.phone || 'Phone not set'}
                      </div>
                    </div>
                  </div>

                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleUploadClick}
                    className="rounded-lg h-8 px-3 text-xs self-start sm:self-auto"
                  >
                    <Camera className="mr-1.5 h-3.5 w-3.5" />
                    Change Logo
                  </Button>
                </div>
              </div>

              <div className="grid gap-6 lg:grid-cols-3">
                {/* Form Fields Card */}
                <div className="rounded-xl border border-border/70 bg-card p-5 shadow-xs space-y-4 lg:col-span-2">
                  <div className="border-b border-border/60 pb-3">
                    <h3 className="text-sm font-semibold text-foreground">Company Information</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">Primary business attributes and public profile</p>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="companyName" className="text-xs font-medium text-muted-foreground">
                        Company Name <span className="text-rose-500">*</span>
                      </Label>
                      <input
                        id="companyName"
                        name="companyName"
                        value={profile.companyName}
                        onChange={handleChange}
                        placeholder="e.g. HireStream Technologies"
                        className="w-full rounded-lg border border-border/80 bg-muted/30 px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground outline-none focus:ring-1 focus:ring-ring"
                      />
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-1.5">
                        <Label htmlFor="email" className="text-xs font-medium text-muted-foreground">Company Email</Label>
                        <input
                          id="email"
                          name="email"
                          type="email"
                          value={profile.email}
                          onChange={handleChange}
                          placeholder="e.g. contact@hirestream.com"
                          className="w-full rounded-lg border border-border/80 bg-muted/30 px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground outline-none focus:ring-1 focus:ring-ring"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <Label htmlFor="phone" className="text-xs font-medium text-muted-foreground">Phone Number</Label>
                        <input
                          id="phone"
                          name="phone"
                          value={profile.phone}
                          onChange={handleChange}
                          placeholder="e.g. +251 911 234 567"
                          className="w-full rounded-lg border border-border/80 bg-muted/30 px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground outline-none focus:ring-1 focus:ring-ring"
                        />
                      </div>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-1.5">
                        <Label htmlFor="location" className="text-xs font-medium text-muted-foreground">Location</Label>
                        <input
                          id="location"
                          name="location"
                          value={profile.location}
                          onChange={handleChange}
                          placeholder="e.g. Addis Ababa, Ethiopia"
                          className="w-full rounded-lg border border-border/80 bg-muted/30 px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground outline-none focus:ring-1 focus:ring-ring"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <Label htmlFor="website" className="text-xs font-medium text-muted-foreground">Website</Label>
                        <input
                          id="website"
                          name="website"
                          value={profile.website}
                          onChange={handleChange}
                          placeholder="e.g. https://hirestream.com"
                          className="w-full rounded-lg border border-border/80 bg-muted/30 px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground outline-none focus:ring-1 focus:ring-ring"
                        />
                      </div>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-1.5">
                        <Label htmlFor="industry" className="text-xs font-medium text-muted-foreground">Industry</Label>
                        <select
                          id="industry"
                          name="industry"
                          value={profile.industry}
                          onChange={handleChange}
                          className="w-full rounded-lg border border-border/80 bg-muted/30 px-3 py-2 text-xs text-foreground outline-none"
                        >
                          <option>Technology</option>
                          <option>Finance</option>
                          <option>Healthcare</option>
                          <option>Education</option>
                          <option>Marketing</option>
                          <option>Design</option>
                          <option>Construction</option>
                          <option>Other</option>
                        </select>
                      </div>

                      <div className="space-y-1.5">
                        <Label htmlFor="companySize" className="text-xs font-medium text-muted-foreground">Company Size</Label>
                        <select
                          id="companySize"
                          name="companySize"
                          value={profile.companySize}
                          onChange={handleChange}
                          className="w-full rounded-lg border border-border/80 bg-muted/30 px-3 py-2 text-xs text-foreground outline-none"
                        >
                          <option>1–10 employees</option>
                          <option>11–50 employees</option>
                          <option>51–200 employees</option>
                          <option>201–500 employees</option>
                          <option>501–1000 employees</option>
                          <option>1000+ employees</option>
                        </select>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="description" className="text-xs font-medium text-muted-foreground">Company Description</Label>
                      <textarea
                        id="description"
                        name="description"
                        value={profile.description}
                        onChange={handleChange}
                        rows={5}
                        placeholder="Provide a detailed description of your organization..."
                        className="w-full rounded-lg border border-border/80 bg-muted/30 px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground outline-none focus:ring-1 focus:ring-ring resize-y"
                      />
                    </div>

                    <div className="flex flex-col-reverse gap-2.5 border-t border-border/60 pt-4 sm:flex-row sm:justify-end">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleCancel}
                        disabled={isSaving}
                        className="rounded-lg h-8 px-3 text-xs"
                      >
                        <X className="mr-1.5 h-3.5 w-3.5" />
                        Cancel
                      </Button>

                      <Button
                        type="button"
                        size="sm"
                        onClick={handleSave}
                        disabled={isSaving}
                        className="rounded-lg h-8 px-3.5 text-xs font-medium bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 hover:opacity-90"
                      >
                        {isSaving ? (
                          <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <Save className="mr-1.5 h-3.5 w-3.5" />
                        )}
                        {isSaving ? 'Saving...' : 'Save Changes'}
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Account Status Sidebar */}
                <div className="space-y-6">
                  <div className="rounded-xl border border-border/70 bg-card p-5 shadow-xs space-y-4">
                    <div className="border-b border-border/60 pb-3">
                      <h3 className="text-sm font-semibold text-foreground">Verification Status</h3>
                      <p className="text-xs text-muted-foreground mt-0.5">Platform compliance standing</p>
                    </div>

                    {approvalStatus === 'approved' ? (
                      <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-3.5 flex items-start gap-2.5 text-emerald-800 dark:text-emerald-300">
                        <CheckCircle className="mt-0.5 h-4 w-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
                        <div>
                          <p className="text-xs font-semibold">Account Verified</p>
                          <p className="text-[11px] text-emerald-700/90 dark:text-emerald-400/90 mt-0.5">
                            Your employer profile is approved. Job postings will be reviewed with priority.
                          </p>
                        </div>
                      </div>
                    ) : approvalStatus === 'rejected' ? (
                      <div className="rounded-xl border border-rose-500/20 bg-rose-500/10 p-3.5 flex items-start gap-2.5 text-rose-800 dark:text-rose-300">
                        <XCircle className="mt-0.5 h-4 w-4 text-rose-600 dark:text-rose-400 flex-shrink-0" />
                        <div>
                          <p className="text-xs font-semibold">Verification Rejected</p>
                          <p className="text-[11px] text-rose-700/90 dark:text-rose-400/90 mt-0.5">
                            Profile approval was rejected by administrator. Please update and re-save.
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="rounded-xl border border-amber-500/20 bg-amber-500/10 p-3.5 flex items-start gap-2.5 text-amber-800 dark:text-amber-300">
                        <Clock className="mt-0.5 h-4 w-4 text-amber-600 dark:text-amber-400 flex-shrink-0" />
                        <div>
                          <p className="text-xs font-semibold">Pending Verification</p>
                          <p className="text-[11px] text-amber-700/90 dark:text-amber-400/90 mt-0.5">
                            Profile is pending administrator verification.
                          </p>
                        </div>
                      </div>
                    )}

                    <div className="space-y-2.5 pt-1 text-xs">
                      <div className="flex items-center justify-between py-1 border-b border-border/40">
                        <span className="text-muted-foreground">Profile Status</span>
                        <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                          {profile.companyName ? 'Complete' : 'Incomplete'}
                        </span>
                      </div>

                      <div className="flex items-center justify-between py-1 border-b border-border/40">
                        <span className="text-muted-foreground">Job Posting</span>
                        <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                          {approvalStatus === 'approved' ? 'Enabled' : 'Pending Verification'}
                        </span>
                      </div>

                      <div className="flex items-center justify-between py-1">
                        <span className="text-muted-foreground">Account Type</span>
                        <span className="font-semibold text-foreground">Employer Organization</span>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-xl border border-border/70 bg-card p-5 shadow-xs space-y-2">
                    <h3 className="text-xs font-semibold text-foreground">Profile Guidelines</h3>
                    <p className="text-xs leading-relaxed text-muted-foreground">
                      Keep your company information up to date so job seekers can learn more about your organization, work culture, and mission before applying.
                    </p>
                  </div>
                </div>
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  )
}
