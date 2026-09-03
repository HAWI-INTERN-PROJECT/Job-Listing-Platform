import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  AlertCircle,
  Briefcase,
  CheckCircle,
  Loader2,
  Save,
  Send,
} from 'lucide-react'

import EmployerSidebar from '@/components/employer/EmployerSidebar'
import EmployerHeader from '@/components/employer/EmployerHeader'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import api from '@/lib/api'

type Category = {
  id: number
  name: string
}

export default function CreateJobPage() {
  const navigate = useNavigate()

  const [categories, setCategories] = useState<Category[]>([])
  const [hasEmployerProfile, setHasEmployerProfile] = useState<boolean | null>(null)
  const [isLoadingPage, setIsLoadingPage] = useState(true)

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    category_id: '',
    job_type: 'full_time',
    experience_level: 'mid',
    location: '',
    is_remote: false,
    salary_min: '',
    salary_max: '',
    salary_currency: 'USD',
    description: '',
    responsibilities: '',
    requirements: '',
  })

  useEffect(() => {
    async function loadData() {
      try {
        setIsLoadingPage(true)
        // Fetch categories
        const catRes = await api.get('/categories')
        if (catRes.data.success) {
          setCategories(catRes.data.data || [])
        }

        // Check employer profile
        try {
          const profileRes = await api.get('/employer/profile')
          if (profileRes.data.success && profileRes.data.data) {
            setHasEmployerProfile(true)
          } else {
            setHasEmployerProfile(false)
          }
        } catch {
          setHasEmployerProfile(false)
        }
      } catch (err: any) {
        console.error('Error loading page data:', err)
      } finally {
        setIsLoadingPage(false)
      }
    }

    loadData()
  }, [])

  function handleChange(
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) {
    const { name, value, type } = e.target

    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked
      setFormData((prev) => ({ ...prev, [name]: checked }))
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }))
    }
  }

  async function handleSubmit(submitNow: boolean) {
    try {
      setIsSubmitting(true)
      setErrorMessage('')
      setSuccessMessage('')

      if (!formData.title.trim()) {
        setErrorMessage('Job title is required.')
        setIsSubmitting(false)
        return
      }

      if (!formData.category_id) {
        setErrorMessage('Please select a job category.')
        setIsSubmitting(false)
        return
      }

      if (!formData.description.trim()) {
        setErrorMessage('Job description is required.')
        setIsSubmitting(false)
        return
      }

      const payload = {
        title: formData.title,
        category_id: parseInt(formData.category_id, 10),
        job_type: formData.job_type,
        experience_level: formData.experience_level,
        location: formData.location || null,
        is_remote: formData.is_remote,
        salary_min: formData.salary_min ? parseInt(formData.salary_min, 10) : null,
        salary_max: formData.salary_max ? parseInt(formData.salary_max, 10) : null,
        salary_currency: formData.salary_currency,
        description: formData.description,
        responsibilities: formData.responsibilities
          ? formData.responsibilities.split('\n').filter((line) => line.trim().length > 0)
          : [],
        requirements: formData.requirements
          ? formData.requirements.split('\n').filter((line) => line.trim().length > 0)
          : [],
        submit_now: submitNow,
      }

      const res = await api.post('/employer/jobs', payload)

      if (res.data.success) {
        const msg = submitNow
          ? 'Job post created and submitted for review successfully!'
          : 'Job post draft saved successfully!'
        setSuccessMessage(msg)

        setTimeout(() => {
          navigate('/my-job-posts')
        }, 1500)
      }
    } catch (err: any) {
      const msg =
        err.response?.data?.message ||
        'Failed to create job post. Please verify your inputs.'
      setErrorMessage(msg)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-muted/40 md:flex">
      <EmployerSidebar />

      <div className="min-w-0 flex-1">
        <EmployerHeader title="Create Job" />

        <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="mb-6">
            <h1 className="text-2xl font-bold tracking-tight">Create a New Job</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Provide the position details to post a job or save it as a draft.
            </p>
          </div>

          {isLoadingPage ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-3 text-sm text-muted-foreground">Loading categories...</span>
            </div>
          ) : hasEmployerProfile === false ? (
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-6 text-amber-900">
              <div className="flex items-start gap-3">
                <AlertCircle className="mt-0.5 h-6 w-6 text-amber-600" />
                <div>
                  <h3 className="font-semibold text-amber-900">Company Profile Required</h3>
                  <p className="mt-1 text-sm text-amber-800">
                    You need to complete your company profile before posting or creating job listings.
                  </p>
                  <Button
                    className="mt-4"
                    onClick={() => navigate('/company-profile')}
                  >
                    Set Up Company Profile
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {successMessage && (
                <div className="flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
                  <CheckCircle className="h-5 w-5" />
                  {successMessage}
                </div>
              )}

              {errorMessage && (
                <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  <AlertCircle className="h-5 w-5" />
                  {errorMessage}
                </div>
              )}

              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  handleSubmit(true)
                }}
                className="space-y-6"
              >
                {/* Basic Information */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Briefcase className="h-5 w-5 text-primary" />
                      Basic Information
                    </CardTitle>
                  </CardHeader>

                  <CardContent className="grid gap-5 md:grid-cols-2">
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="title">
                        Job Title <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="title"
                        name="title"
                        value={formData.title}
                        onChange={handleChange}
                        placeholder="e.g. Senior React Developer"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="category_id">
                        Job Category <span className="text-destructive">*</span>
                      </Label>
                      <select
                        id="category_id"
                        name="category_id"
                        value={formData.category_id}
                        onChange={handleChange}
                        className="flex h-10 w-full rounded-md border bg-background px-3 py-2 text-sm"
                        required
                      >
                        <option value="">Select category</option>
                        {categories.map((cat) => (
                          <option key={cat.id} value={cat.id}>
                            {cat.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="job_type">
                        Employment Type <span className="text-destructive">*</span>
                      </Label>
                      <select
                        id="job_type"
                        name="job_type"
                        value={formData.job_type}
                        onChange={handleChange}
                        className="flex h-10 w-full rounded-md border bg-background px-3 py-2 text-sm"
                        required
                      >
                        <option value="full_time">Full-time</option>
                        <option value="part_time">Part-time</option>
                        <option value="contract">Contract</option>
                        <option value="freelance">Freelance</option>
                        <option value="internship">Internship</option>
                        <option value="remote">Remote Only</option>
                      </select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="experience_level">
                        Experience Level <span className="text-destructive">*</span>
                      </Label>
                      <select
                        id="experience_level"
                        name="experience_level"
                        value={formData.experience_level}
                        onChange={handleChange}
                        className="flex h-10 w-full rounded-md border bg-background px-3 py-2 text-sm"
                        required
                      >
                        <option value="entry">Entry Level</option>
                        <option value="mid">Mid Level</option>
                        <option value="senior">Senior Level</option>
                        <option value="lead">Lead</option>
                        <option value="executive">Executive</option>
                      </select>
                    </div>
                  </CardContent>
                </Card>

                {/* Location & Work Mode */}
                <Card>
                  <CardHeader>
                    <CardTitle>Job Location & Remote Option</CardTitle>
                  </CardHeader>

                  <CardContent className="grid gap-5 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="location">Location</Label>
                      <Input
                        id="location"
                        name="location"
                        value={formData.location}
                        onChange={handleChange}
                        placeholder="e.g. Addis Ababa, Ethiopia"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="is_remote">Work Mode</Label>
                      <select
                        id="is_remote"
                        name="is_remote"
                        value={formData.is_remote ? 'true' : 'false'}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            is_remote: e.target.value === 'true',
                          }))
                        }
                        className="flex h-10 w-full rounded-md border bg-background px-3 py-2 text-sm"
                      >
                        <option value="false">On-site</option>
                        <option value="true">Remote Supported</option>
                      </select>
                    </div>
                  </CardContent>
                </Card>

                {/* Salary Details */}
                <Card>
                  <CardHeader>
                    <CardTitle>Compensation (Optional)</CardTitle>
                  </CardHeader>

                  <CardContent className="grid gap-5 md:grid-cols-3">
                    <div className="space-y-2">
                      <Label htmlFor="salary_min">Minimum Salary</Label>
                      <Input
                        id="salary_min"
                        name="salary_min"
                        type="number"
                        min="0"
                        value={formData.salary_min}
                        onChange={handleChange}
                        placeholder="e.g. 1000"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="salary_max">Maximum Salary</Label>
                      <Input
                        id="salary_max"
                        name="salary_max"
                        type="number"
                        min="0"
                        value={formData.salary_max}
                        onChange={handleChange}
                        placeholder="e.g. 2500"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="salary_currency">Currency</Label>
                      <select
                        id="salary_currency"
                        name="salary_currency"
                        value={formData.salary_currency}
                        onChange={handleChange}
                        className="flex h-10 w-full rounded-md border bg-background px-3 py-2 text-sm"
                      >
                        <option value="USD">USD ($)</option>
                        <option value="ETB">ETB (Br)</option>
                        <option value="EUR">EUR (€)</option>
                        <option value="GBP">GBP (£)</option>
                      </select>
                    </div>
                  </CardContent>
                </Card>

                {/* Job Description, Responsibilities & Requirements */}
                <Card>
                  <CardHeader>
                    <CardTitle>Job Details & Description</CardTitle>
                  </CardHeader>

                  <CardContent className="grid gap-5">
                    <div className="space-y-2">
                      <Label htmlFor="description">
                        Job Description <span className="text-destructive">*</span>
                      </Label>
                      <textarea
                        id="description"
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        className="min-h-24 w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
                        placeholder="Provide a detailed description of the role..."
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="responsibilities">Responsibilities</Label>
                      <textarea
                        id="responsibilities"
                        name="responsibilities"
                        value={formData.responsibilities}
                        onChange={handleChange}
                        className="min-h-24 w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
                        placeholder="List key responsibilities (one per line)..."
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="requirements">Requirements</Label>
                      <textarea
                        id="requirements"
                        name="requirements"
                        value={formData.requirements}
                        onChange={handleChange}
                        className="min-h-24 w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
                        placeholder="List key qualifications and skills required (one per line)..."
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Review Alert */}
                <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 text-sm text-blue-800">
                  <p className="font-medium">Admin Approval Notice</p>
                  <p className="mt-1">
                    When you click "Post Job", your listing will be submitted for admin review before becoming publicly visible. Saving as a draft lets you edit it anytime later.
                  </p>
                </div>

                {/* Actions */}
                <div className="flex flex-col-reverse gap-3 border-t pt-5 sm:flex-row sm:justify-end">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate('/my-job-posts')}
                    disabled={isSubmitting}
                  >
                    Cancel
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => handleSubmit(false)}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Save className="mr-2 h-4 w-4" />
                    )}
                    Save as Draft
                  </Button>

                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="mr-2 h-4 w-4" />
                    )}
                    Post Job
                  </Button>
                </div>
              </form>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}