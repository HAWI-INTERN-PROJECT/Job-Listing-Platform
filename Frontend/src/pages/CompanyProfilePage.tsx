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
import { Input } from '@/components/ui/input'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
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
    <div className="h-screen flex overflow-hidden bg-muted/40">
      <EmployerSidebar />

      <div className="min-w-0 flex-1 overflow-y-auto pt-14 md:pt-0">
        <EmployerHeader title="Company Profile" />

        <main className="mx-auto max-w-7xl space-y-6 p-4 sm:p-6">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              Company Profile
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Manage your organization profile, contact details, and branding.
            </p>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-3 text-sm text-muted-foreground">Loading profile...</span>
            </div>
          ) : (
            <>
              {message && (
                <div className="flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
                  <CheckCircle className="h-5 w-5" />
                  {message}
                </div>
              )}

              {errorMessage && (
                <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  <AlertCircle className="h-5 w-5" />
                  {errorMessage}
                </div>
              )}

              <Card>
                <CardContent className="flex flex-col gap-6 p-6 sm:flex-row sm:items-center">
                  <div className="relative">
                    <div className="flex h-28 w-28 items-center justify-center overflow-hidden rounded-xl border bg-primary text-3xl font-bold text-primary-foreground">
                      {logoPreview ? (
                        <img
                          src={logoPreview}
                          alt="Company logo"
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <Building2 className="h-12 w-12" />
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={handleUploadClick}
                      className="absolute -bottom-2 -right-2 flex h-9 w-9 items-center justify-center rounded-full border bg-background shadow-sm hover:bg-muted"
                      title="Change company logo"
                    >
                      <Camera className="h-4 w-4" />
                    </button>

                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleLogoChange}
                      className="hidden"
                    />
                  </div>

                  <div className="flex-1">
                    <h2 className="text-xl font-bold">
                      {profile.companyName || 'Your Company Name'}
                    </h2>

                    <div className="mt-3 flex flex-col gap-2 text-sm text-muted-foreground sm:flex-row sm:flex-wrap sm:gap-5">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        {profile.location || 'Location not set'}
                      </div>

                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4" />
                        {profile.email || 'Email not set'}
                      </div>

                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4" />
                        {profile.phone || 'Phone not set'}
                      </div>
                    </div>
                  </div>

                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleUploadClick}
                  >
                    <Camera className="mr-2 h-4 w-4" />
                    Change Logo
                  </Button>
                </CardContent>
              </Card>

              <div className="grid gap-6 lg:grid-cols-3">
                <Card className="lg:col-span-2">
                  <CardHeader>
                    <CardTitle>Company Information</CardTitle>
                  </CardHeader>

                  <CardContent className="space-y-5">
                    <div>
                      <label htmlFor="companyName" className="text-sm font-medium">
                        Company Name *
                      </label>
                      <Input
                        id="companyName"
                        name="companyName"
                        value={profile.companyName}
                        onChange={handleChange}
                        placeholder="e.g. HireStream Technologies"
                        className="mt-2"
                      />
                    </div>

                    <div className="grid gap-5 md:grid-cols-2">
                      <div>
                        <label htmlFor="email" className="text-sm font-medium">
                          Company Email
                        </label>
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          value={profile.email}
                          onChange={handleChange}
                          placeholder="e.g. contact@hirestream.com"
                          className="mt-2"
                        />
                      </div>

                      <div>
                        <label htmlFor="phone" className="text-sm font-medium">
                          Phone Number
                        </label>
                        <Input
                          id="phone"
                          name="phone"
                          value={profile.phone}
                          onChange={handleChange}
                          placeholder="e.g. +251 911 234 567"
                          className="mt-2"
                        />
                      </div>
                    </div>

                    <div className="grid gap-5 md:grid-cols-2">
                      <div>
                        <label htmlFor="location" className="text-sm font-medium">
                          Location
                        </label>
                        <Input
                          id="location"
                          name="location"
                          value={profile.location}
                          onChange={handleChange}
                          placeholder="e.g. Addis Ababa, Ethiopia"
                          className="mt-2"
                        />
                      </div>

                      <div>
                        <label htmlFor="website" className="text-sm font-medium">
                          Website
                        </label>
                        <Input
                          id="website"
                          name="website"
                          value={profile.website}
                          onChange={handleChange}
                          placeholder="e.g. https://hirestream.com"
                          className="mt-2"
                        />
                      </div>
                    </div>

                    <div className="grid gap-5 md:grid-cols-2">
                      <div>
                        <label htmlFor="industry" className="text-sm font-medium">
                          Industry
                        </label>
                        <select
                          id="industry"
                          name="industry"
                          value={profile.industry}
                          onChange={handleChange}
                          className="mt-2 h-10 w-full rounded-md border bg-background px-3 text-sm"
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

                      <div>
                        <label htmlFor="companySize" className="text-sm font-medium">
                          Company Size
                        </label>
                        <select
                          id="companySize"
                          name="companySize"
                          value={profile.companySize}
                          onChange={handleChange}
                          className="mt-2 h-10 w-full rounded-md border bg-background px-3 text-sm"
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

                    <div>
                      <label htmlFor="description" className="text-sm font-medium">
                        Company Description
                      </label>
                      <textarea
                        id="description"
                        name="description"
                        value={profile.description}
                        onChange={handleChange}
                        rows={6}
                        placeholder="Provide a detailed description of your organization..."
                        className="mt-2 w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                      />
                    </div>

                    <div className="flex flex-col-reverse gap-3 border-t pt-5 sm:flex-row sm:justify-end">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleCancel}
                        disabled={isSaving}
                      >
                        <X className="mr-2 h-4 w-4" />
                        Cancel
                      </Button>

                      <Button
                        type="button"
                        onClick={handleSave}
                        disabled={isSaving}
                      >
                        {isSaving ? (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                          <Save className="mr-2 h-4 w-4" />
                        )}
                        {isSaving ? 'Saving...' : 'Save Changes'}
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <div className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Account Status</CardTitle>
                    </CardHeader>

                    <CardContent className="space-y-5">
                      {approvalStatus === 'approved' ? (
                        <div className="rounded-lg border border-green-200 bg-green-50 p-4">
                          <div className="flex items-start gap-3">
                            <CheckCircle className="mt-0.5 h-5 w-5 text-green-600" />
                            <div>
                              <p className="font-semibold text-green-800">Approved</p>
                              <p className="mt-1 text-sm text-green-700">
                                Your employer account has been approved.
                              </p>
                            </div>
                          </div>
                        </div>
                      ) : approvalStatus === 'rejected' ? (
                        <div className="rounded-lg border border-red-200 bg-red-50 p-4">
                          <div className="flex items-start gap-3">
                            <XCircle className="mt-0.5 h-5 w-5 text-red-600" />
                            <div>
                              <p className="font-semibold text-red-800">Rejected</p>
                              <p className="mt-1 text-sm text-red-700">
                                Profile approval was rejected by admin.
                              </p>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
                          <div className="flex items-start gap-3">
                            <Clock className="mt-0.5 h-5 w-5 text-amber-600" />
                            <div>
                              <p className="font-semibold text-amber-800">Pending Review</p>
                              <p className="mt-1 text-sm text-amber-700">
                                Profile is pending administrator verification.
                              </p>
                            </div>
                          </div>
                        </div>
                      )}

                      <div className="space-y-3">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Company Profile</span>
                          <span className="font-medium text-green-600">
                            {profile.companyName ? 'Complete' : 'Incomplete'}
                          </span>
                        </div>

                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Job Posting</span>
                          <span className="font-medium text-green-600">
                            {approvalStatus === 'approved' ? 'Enabled' : 'Pending Approval'}
                          </span>
                        </div>

                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Account Type</span>
                          <span className="font-medium">Employer</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Profile Tips</CardTitle>
                    </CardHeader>

                    <CardContent>
                      <p className="text-sm leading-6 text-muted-foreground">
                        Keep your company information up to date so job seekers can learn more about your organization before applying.
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  )
}