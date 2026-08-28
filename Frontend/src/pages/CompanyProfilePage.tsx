import { useEffect, useRef, useState } from 'react'
import {
  Building2,
  Camera,
  CheckCircle,
  Mail,
  MapPin,
  Phone,
  Save,
  X,
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

const initialProfile: CompanyProfile = {
  companyName: 'HireStream Technologies',
  email: 'contact@hirestream.com',
  phone: '+251 911 234 567',
  location: 'Addis Ababa, Ethiopia',
  website: 'https://hirestream.com',
  industry: 'Technology',
  companySize: '51–200 employees',
  description:
    'HireStream Technologies is a growing technology company focused on building modern digital solutions and connecting talented professionals with great opportunities.',
}

export default function CompanyProfilePage() {
  const [profile, setProfile] =
    useState<CompanyProfile>(initialProfile)

  const [savedProfile, setSavedProfile] =
    useState<CompanyProfile>(initialProfile)

  const [logo, setLogo] = useState<string | null>(null)

  const [savedLogo, setSavedLogo] =
    useState<string | null>(null)

  const [message, setMessage] = useState('')

  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
  return () => {
    if (logo) {
      URL.revokeObjectURL(logo)
    }

    if (savedLogo && savedLogo !== logo) {
      URL.revokeObjectURL(savedLogo)
    }
  }
}, [logo, savedLogo])

  function handleChange(
    event: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) {
    const { name, value } = event.target

    setProfile((currentProfile) => ({
      ...currentProfile,
      [name]: value,
    }))
  }

  function handleLogoChange(
    event: React.ChangeEvent<HTMLInputElement>,
  ) {
    const file = event.target.files?.[0]

    if (!file) {
      return
    }

    const imageUrl = URL.createObjectURL(file)

    setLogo(imageUrl)
    setMessage('')
  }

  function handleSave() {
    setSavedProfile({ ...profile })
    setSavedLogo(logo)

    setMessage('Company profile saved successfully.')

    window.setTimeout(() => {
      setMessage('')
    }, 3000)
  }

  function handleCancel() {
    setProfile({ ...savedProfile })
    setLogo(savedLogo)

    setMessage('Changes have been cancelled.')

    window.setTimeout(() => {
      setMessage('')
    }, 3000)
  }

  function handleUploadClick() {
    fileInputRef.current?.click()
  }

  return (
    <div className="min-h-screen bg-muted/40 md:flex">
      <EmployerSidebar />

      <div className="min-w-0 flex-1">
        <EmployerHeader title="Company Profile" />

        <main className="mx-auto max-w-7xl space-y-6 p-4 sm:p-6">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              Company Profile
            </h1>

            <p className="mt-1 text-sm text-muted-foreground">
              Manage your company information and employer profile.
            </p>
          </div>

          {message && (
            <div className="flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
              <CheckCircle className="h-5 w-5" />
              {message}
            </div>
          )}

          <Card>
            <CardContent className="flex flex-col gap-6 p-6 sm:flex-row sm:items-center">
              <div className="relative">
                <div className="flex h-28 w-28 items-center justify-center overflow-hidden rounded-xl border bg-primary text-3xl font-bold text-primary-foreground">
                  {logo ? (
                    <img
                      src={logo}
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
                  {profile.companyName}
                </h2>

                <div className="mt-3 flex flex-col gap-2 text-sm text-muted-foreground sm:flex-row sm:flex-wrap sm:gap-5">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    {profile.location}
                  </div>

                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    {profile.email}
                  </div>

                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    {profile.phone}
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
                  <label
                    htmlFor="companyName"
                    className="text-sm font-medium"
                  >
                    Company Name
                  </label>

                  <Input
                    id="companyName"
                    name="companyName"
                    value={profile.companyName}
                    onChange={handleChange}
                    className="mt-2"
                  />
                </div>

                <div className="grid gap-5 md:grid-cols-2">
                  <div>
                    <label
                      htmlFor="email"
                      className="text-sm font-medium"
                    >
                      Company Email
                    </label>

                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={profile.email}
                      onChange={handleChange}
                      className="mt-2"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="phone"
                      className="text-sm font-medium"
                    >
                      Phone Number
                    </label>

                    <Input
                      id="phone"
                      name="phone"
                      value={profile.phone}
                      onChange={handleChange}
                      className="mt-2"
                    />
                  </div>
                </div>

                <div className="grid gap-5 md:grid-cols-2">
                  <div>
                    <label
                      htmlFor="location"
                      className="text-sm font-medium"
                    >
                      Location
                    </label>

                    <Input
                      id="location"
                      name="location"
                      value={profile.location}
                      onChange={handleChange}
                      className="mt-2"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="website"
                      className="text-sm font-medium"
                    >
                      Website
                    </label>

                    <Input
                      id="website"
                      name="website"
                      value={profile.website}
                      onChange={handleChange}
                      className="mt-2"
                    />
                  </div>
                </div>

                <div className="grid gap-5 md:grid-cols-2">
                  <div>
                    <label
                      htmlFor="industry"
                      className="text-sm font-medium"
                    >
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
                    <label
                      htmlFor="companySize"
                      className="text-sm font-medium"
                    >
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
                  <label
                    htmlFor="description"
                    className="text-sm font-medium"
                  >
                    Company Description
                  </label>

                  <textarea
                    id="description"
                    name="description"
                    value={profile.description}
                    onChange={handleChange}
                    rows={6}
                    className="mt-2 w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>

                <div className="flex flex-col-reverse gap-3 border-t pt-5 sm:flex-row sm:justify-end">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleCancel}
                  >
                    <X className="mr-2 h-4 w-4" />
                    Cancel
                  </Button>

                  <Button
                    type="button"
                    onClick={handleSave}
                  >
                    <Save className="mr-2 h-4 w-4" />
                    Save Changes
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
                  <div className="rounded-lg border border-green-200 bg-green-50 p-4">
                    <div className="flex items-start gap-3">
                      <CheckCircle className="mt-0.5 h-5 w-5 text-green-600" />

                      <div>
                        <p className="font-semibold text-green-800">
                          Approved
                        </p>

                        <p className="mt-1 text-sm text-green-700">
                          Your employer account has been approved.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">
                        Company Profile
                      </span>

                      <span className="font-medium text-green-600">
                        Complete
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">
                        Job Posting
                      </span>

                      <span className="font-medium text-green-600">
                        Enabled
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">
                        Account Type
                      </span>

                      <span className="font-medium">
                        Employer
                      </span>
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
                    Keep your company information up to date so job seekers
                    can learn more about your organization before applying.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}