import { Bell } from 'lucide-react'

interface EmployerHeaderProps {
  title: string
}

export default function EmployerHeader({ title }: EmployerHeaderProps) {
  return (
    <header className="flex h-16 items-center justify-between border-b bg-background px-4 sm:px-6">
      <h1 className="text-xl font-semibold">{title}</h1>

      <div className="flex items-center gap-4">
        <button
          type="button"
          className="rounded-full p-2 hover:bg-muted"
          aria-label="Notifications"
        >
          <Bell className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-sm font-medium text-primary-foreground">
            AR
          </div>

          <div className="hidden sm:block">
            <p className="text-sm font-medium">Employer</p>
            <p className="text-xs text-muted-foreground">Company Admin</p>
          </div>
        </div>
      </div>
    </header>
  )
}