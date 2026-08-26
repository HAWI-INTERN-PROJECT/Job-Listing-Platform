import { ArrowLeft, Download } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

export default function ApplicantDetailsPage() {
  return (
    <div className="min-h-screen bg-muted/40">
      {/* Top Header */}
      <header className="border-b bg-background">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <h1 className="text-xl font-semibold">Applicant Details</h1>

          <div className="flex items-center gap-4">
            <span className="text-lg">🔔</span>

            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
              E
            </div>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {/* Header Information */}
        <div className="mb-5">
          <Link
            to="/job-applicants"
            className="mb-4 inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Applicants
          </Link>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-2xl font-bold">Alex Rivers</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Senior React Developer
              </p>
            </div>

            <span className="w-fit rounded-full bg-yellow-100 px-3 py-1 text-xs font-medium text-yellow-700">
              Under Review
            </span>
          </div>
        </div>

        {/* Two Column Layout */}
        <div className="grid gap-5 lg:grid-cols-2">
          {/* Applicant Profile */}
          <Card>
            <CardHeader>
              <CardTitle>Applicant Profile</CardTitle>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Avatar */}
              <div className="flex items-center gap-4 border-b pb-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-xl font-semibold text-primary-foreground">
                  AR
                </div>

                <div>
                  <h3 className="font-semibold">Alex Rivers</h3>
                  <p className="text-sm text-muted-foreground">
                    React Developer
                  </p>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-xs text-muted-foreground">Email</p>
                  <p className="mt-1 text-sm font-medium">
                    alex.rivers@example.com
                  </p>
                </div>

                <div>
                  <p className="text-xs text-muted-foreground">Phone</p>
                  <p className="mt-1 text-sm font-medium">
                    +251 91 234 5678
                  </p>
                </div>

                <div>
                  <p className="text-xs text-muted-foreground">Location</p>
                  <p className="mt-1 text-sm font-medium">
                    Addis Ababa, Ethiopia
                  </p>
                </div>

                <div>
                  <p className="text-xs text-muted-foreground">Education</p>
                  <p className="mt-1 text-sm font-medium">
                    BSc Software Engineering
                  </p>
                </div>
              </div>

              <div>
                <p className="text-xs text-muted-foreground">Skills</p>

                <div className="mt-2 flex flex-wrap gap-2">
                  {['React', 'TypeScript', 'JavaScript', 'CSS', 'Git'].map(
                    (skill) => (
                      <span
                        key={skill}
                        className="rounded-full bg-muted px-3 py-1 text-xs font-medium"
                      >
                        {skill}
                      </span>
                    ),
                  )}
                </div>
              </div>

              <div>
                <p className="text-xs text-muted-foreground">Experience</p>
                <p className="mt-1 text-sm font-medium">3 years</p>
              </div>
            </CardContent>
          </Card>

          {/* Application */}
          <Card>
            <CardHeader>
              <CardTitle>Application</CardTitle>
            </CardHeader>

            <CardContent className="space-y-5">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-xs text-muted-foreground">Job Title</p>
                  <p className="mt-1 text-sm font-medium">
                    Senior React Developer
                  </p>
                </div>

                <div>
                  <p className="text-xs text-muted-foreground">
                    Application Date
                  </p>
                  <p className="mt-1 text-sm font-medium">
                    Aug 12, 2026
                  </p>
                </div>
              </div>

              <div>
                <p className="text-xs text-muted-foreground">
                  Current Status
                </p>

                <span className="mt-2 inline-block rounded-full bg-yellow-100 px-3 py-1 text-xs font-medium text-yellow-700">
                  Under Review
                </span>
              </div>

              {/* CV */}
              <div className="flex items-center justify-between rounded-lg border p-4">
                <div>
                  <p className="text-sm font-medium">Alex_Rivers_CV.pdf</p>
                  <p className="text-xs text-muted-foreground">
                    PDF document
                  </p>
                </div>

                <Button variant="outline" size="sm">
                  <Download className="mr-2 h-4 w-4" />
                  Download CV
                </Button>
              </div>

              {/* Change Status */}
              <div className="border-t pt-5">
                <p className="mb-2 text-sm font-medium">
                  Change Application Status
                </p>

                <select
  defaultValue="Under Review"
  className="h-10 w-full rounded-md border bg-background px-3 text-sm"
>
  <option value="Submitted">Submitted</option>
  <option value="Under Review">Under Review</option>
  <option value="Shortlisted">Shortlisted</option>
  <option value="Rejected">Rejected</option>
  <option value="Hired">Hired</option>
</select>

                <Button className="mt-3 w-full">
                  Update Status
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Timeline */}
        <Card className="mt-5">
          <CardHeader>
            <CardTitle>Application Timeline</CardTitle>
          </CardHeader>

          <CardContent>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
                  ✓
                </span>
                <span className="text-sm font-medium">Applied</span>
              </div>

              <span className="hidden text-muted-foreground sm:block">
                →
              </span>

              <div className="flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
                  ✓
                </span>
                <span className="text-sm font-medium">Under Review</span>
              </div>

              <span className="hidden text-muted-foreground sm:block">
                →
              </span>

              <div className="flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-full border text-xs">
                  3
                </span>
                <span className="text-sm text-muted-foreground">
                  Shortlisted
                </span>
              </div>

              <span className="hidden text-muted-foreground sm:block">
                →
              </span>

              <div className="flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-full border text-xs">
                  4
                </span>
                <span className="text-sm text-muted-foreground">
                  Hired / Rejected
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}