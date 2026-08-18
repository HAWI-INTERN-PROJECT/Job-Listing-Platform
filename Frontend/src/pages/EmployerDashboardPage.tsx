import { Briefcase, Plus, Users, Eye, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

export default function EmployerDashboardPage() {
  return (
    <div className="min-h-screen bg-muted/40">
      {/* Header */}
      <header className="border-b bg-background">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div>
            <h1 className="text-xl font-semibold">Employer Dashboard</h1>
            <p className="text-sm text-muted-foreground">
              Manage your job listings and applications
            </p>
          </div>

          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Post a Job
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Welcome */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold tracking-tight">
            Welcome back!
          </h2>
          <p className="mt-1 text-muted-foreground">
            Here's an overview of your job listings and applications.
          </p>
        </div>

        {/* Statistics */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardContent className="flex items-center gap-4 p-6">
              <div className="rounded-lg bg-muted p-3">
                <Briefcase className="h-5 w-5" />
              </div>

              <div>
                <p className="text-sm text-muted-foreground">
                  Active Jobs
                </p>
                <p className="text-2xl font-bold">12</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex items-center gap-4 p-6">
              <div className="rounded-lg bg-muted p-3">
                <Users className="h-5 w-5" />
              </div>

              <div>
                <p className="text-sm text-muted-foreground">
                  Applications
                </p>
                <p className="text-2xl font-bold">48</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex items-center gap-4 p-6">
              <div className="rounded-lg bg-muted p-3">
                <Eye className="h-5 w-5" />
              </div>

              <div>
                <p className="text-sm text-muted-foreground">
                  Job Views
                </p>
                <p className="text-2xl font-bold">326</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex items-center gap-4 p-6">
              <div className="rounded-lg bg-muted p-3">
                <Clock className="h-5 w-5" />
              </div>

              <div>
                <p className="text-sm text-muted-foreground">
                  Pending
                </p>
                <p className="text-2xl font-bold">8</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Jobs */}
        <Card className="mt-8">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Recent Job Listings</CardTitle>

              <Button variant="outline" size="sm">
                View All
              </Button>
            </div>
          </CardHeader>

          <CardContent>
            <div className="space-y-4">
              <div className="flex flex-col gap-3 rounded-lg border p-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h3 className="font-medium">Frontend Developer</h3>
                  <p className="text-sm text-muted-foreground">
                    14 applications
                  </p>
                </div>

                <span className="w-fit rounded-full bg-muted px-3 py-1 text-xs font-medium">
                  Active
                </span>
              </div>

              <div className="flex flex-col gap-3 rounded-lg border p-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h3 className="font-medium">Backend Developer</h3>
                  <p className="text-sm text-muted-foreground">
                    21 applications
                  </p>
                </div>

                <span className="w-fit rounded-full bg-muted px-3 py-1 text-xs font-medium">
                  Active
                </span>
              </div>

              <div className="flex flex-col gap-3 rounded-lg border p-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h3 className="font-medium">UI/UX Designer</h3>
                  <p className="text-sm text-muted-foreground">
                    13 applications
                  </p>
                </div>

                <span className="w-fit rounded-full bg-muted px-3 py-1 text-xs font-medium">
                  Active
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}