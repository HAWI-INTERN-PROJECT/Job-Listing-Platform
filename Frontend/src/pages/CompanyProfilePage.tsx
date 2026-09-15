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
import { getStorageUrl } from '@/lib/utils'

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
  const [imageError, setImageError] = useState(false)
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
          setLogoPreview(getStorageUrl(data.logo))
          setImageError(false)
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
    setImageError(false)
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
          setLogoPreview(getStorageUrl(logoPath))
          setImageError(false)
        }
        if (res.data.data?.approval_status) {
          setApprovalStatus(res.data.data.approval_status)
        }
        setLogoFile(null)

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
                C
              </span>
              <span>Settings</span>
              <span>/</span>
              <span className="text-foreground">Company Profile</span>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-1">
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-foreground">
                  Company Profile
                </h1>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Manage your organization identity, branding logo, contact information, and verification status.
                </p>
              </div>

              {/* Verification Status Pill */}
              <div className="flex items-center gap-2 self-start sm:self-auto">
                <span className="text-xs text-muted-foreground font-medium">Status:</span>
                {approvalStatus === 'approved' && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20">
                    <CheckCircle className="h-3.5 w-3.5" />
                    Verified & Approved
                  </span>
                )}
                {approvalStatus === 'pending' && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20">
                    <Clock className="h-3.5 w-3.5" />
                    Pending Verification
                  </span>
                )}
                {approvalStatus === 'rejected' && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-rose-500/10 text-rose-700 dark:text-rose-400 border border-rose-500/20">
                    <XCircle className="h-3.5 w-3.5" />
                    Rejected
                  </span>
                )}
              </div>
            </div>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-24 text-muted-foreground">
              <Loader2 className="h-6 w-6 animate-spin mr-2" />
              <span className="text-sm">Loading company profile...</span>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Alert Feedback Messages */}
              {message && (
                <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-xs font-medium text-emerald-700 dark:text-emerald-300 flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 flex-shrink-0" />
                  {message}
                </div>
              )}
              {errorMessage && (
                <div className="rounded-lg border border-destructive/20 bg-destructive/10 px-4 py-3 text-xs font-medium text-destructive flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 flex-shrink-0" />
                  {errorMessage}
                </div>
              )}

              {/* Company Banner & Logo Card */}
              <div className="rounded-xl border border-border/70 bg-card p-5 shadow-xs">
                <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
                  <div className="relative">
                    <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-xl border border-border/70 bg-muted text-foreground font-bold text-2xl">
                      {logoPreview && !imageError ? (
                        <img
                          src={logoPreview}
                          alt="Company logo"
                          className="h-full w-full object-cover"
                          onError={() => setImageError(true)}
                        />
                      ) : (
                        <Building2 className="h-10 w-10 text-muted-foreground" />
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={handleUploadClick}
                      className="absolute -bottom-1.5 -right-1.5 flex h-7 w-7 items-center justify-center rounded-full border border-border bg-card text-foreground shadow-xs hover:bg-muted transition-colors cursor-pointer"
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
                    className="self-start sm:self-auto text-xs h-8"
                  >
                    <Camera className="h-3.5 w-3.5 mr-1.5" />
                    Change Logo
                  </Button>
                </div>
              </div>

              {/* Form Grid */}
              <div className="rounded-xl border border-border/70 bg-card p-6 shadow-xs space-y-6">
                <div className="border-b border-border/60 pb-3">
                  <h3 className="font-semibold text-sm text-foreground">General Information</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Basic information visible to prospective job applicants.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <Label htmlFor="companyName" className="text-xs font-medium text-foreground">
                      Company Name *
                    </Label>
                    <input
                      id="companyName"
                      type="text"
                      name="companyName"
                      value={profile.companyName}
                      onChange={handleChange}
                      placeholder="e.g. Acme Corporation"
                      className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-xs shadow-2xs transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="email" className="text-xs font-medium text-foreground">
                      Contact Email *
                    </Label>
                    <input
                      id="email"
                      type="email"
                      name="email"
                      value={profile.email}
                      onChange={handleChange}
                      placeholder="e.g. contact@acme.com"
                      className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-xs shadow-2xs transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="phone" className="text-xs font-medium text-foreground">
                      Phone Number
                    </Label>
                    <input
                      id="phone"
                      type="text"
                      name="phone"
                      value={profile.phone}
                      onChange={handleChange}
                      placeholder="e.g. +1 (555) 000-0000"
                      className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-xs shadow-2xs transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="location" className="text-xs font-medium text-foreground">
                      Headquarters / Location
                    </Label>
                    <input
                      id="location"
                      type="text"
                      name="location"
                      value={profile.location}
                      onChange={handleChange}
                      placeholder="e.g. San Francisco, CA"
                      className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-xs shadow-2xs transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="website" className="text-xs font-medium text-foreground">
                      Company Website
                    </Label>
                    <input
                      id="website"
                      type="text"
                      name="website"
                      value={profile.website}
                      onChange={handleChange}
                      placeholder="e.g. https://acme.com"
                      className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-xs shadow-2xs transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="industry" className="text-xs font-medium text-foreground">
                      Industry
                    </Label>
                    <select
                      id="industry"
                      name="industry"
                      value={profile.industry}
                      onChange={handleChange}
                      className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-xs shadow-2xs transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    >
                      <option value="Technology">Technology & Software</option>
                      <option value="Finance">Banking & Finance</option>
                      <option value="Healthcare">Healthcare & Medicine</option>
                      <option value="Education">Education</option>
                      <option value="Retail">Retail & E-commerce</option>
                      <option value="Marketing">Marketing & Advertising</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div className="space-y-1.5 md:col-span-2">
                    <Label htmlFor="companySize" className="text-xs font-medium text-foreground">
                      Company Size
                    </Label>
                    <select
                      id="companySize"
                      name="companySize"
                      value={profile.companySize}
                      onChange={handleChange}
                      className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-xs shadow-2xs transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    >
                      <option value="1–10 employees">1–10 employees</option>
                      <option value="11–50 employees">11–50 employees</option>
                      <option value="51–200 employees">51–200 employees</option>
                      <option value="201–500 employees">201–500 employees</option>
                      <option value="500+ employees">500+ employees</option>
                    </select>
                  </div>

                  <div className="space-y-1.5 md:col-span-2">
                    <Label htmlFor="description" className="text-xs font-medium text-foreground">
                      About the Company
                    </Label>
                    <textarea
                      id="description"
                      name="description"
                      rows={4}
                      value={profile.description}
                      onChange={handleChange}
                      placeholder="Describe your company mission, culture, and what makes working here exciting..."
                      className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-xs shadow-2xs transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    />
                  </div>
                </div>

                {/* Form Actions Footer */}
                <div className="border-t border-border/60 pt-4 flex items-center justify-end gap-2.5">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleCancel}
                    disabled={isSaving}
                    className="text-xs h-8"
                  >
                    <X className="h-3.5 w-3.5 mr-1.5" />
                    Reset
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    onClick={handleSave}
                    disabled={isSaving}
                    className="text-xs h-8 font-medium"
                  >
                    {isSaving ? (
                      <>
                        <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="h-3.5 w-3.5 mr-1.5" />
                        Save Profile
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
