
import { useEffect, useState } from 'react'
import {
  Bell,
  Eye,
  EyeOff,
  Globe,
  Lock,
  Moon,
  Save,
  Sun,
  User,
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

type Theme = 'light' | 'dark' | 'system'

type Preferences = {
  theme: Theme
  language: string
  emailNotifications: boolean
  applicationNotifications: boolean
  jobNotifications: boolean
}

const initialPreferences: Preferences = {
  theme: 'system',
  language: 'English',
  emailNotifications: true,
  applicationNotifications: true,
  jobNotifications: true,
}

export default function SettingsPage() {
  const [name, setName] = useState('Employer')
  const [email, setEmail] = useState('employer@example.com')

  const [savedName, setSavedName] = useState('Employer')
  const [savedEmail, setSavedEmail] =
    useState('employer@example.com')

  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const [showCurrentPassword, setShowCurrentPassword] =
    useState(false)

  const [showNewPassword, setShowNewPassword] =
    useState(false)

  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false)

  const [preferences, setPreferences] =
    useState<Preferences>(initialPreferences)

  const [savedPreferences, setSavedPreferences] =
    useState<Preferences>(initialPreferences)

  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    if (preferences.theme === 'dark') {
      document.documentElement.classList.add('dark')
    } else if (preferences.theme === 'light') {
      document.documentElement.classList.remove('dark')
    } else {
      const systemPrefersDark =
        window.matchMedia(
          '(prefers-color-scheme: dark)',
        ).matches

      if (systemPrefersDark) {
        document.documentElement.classList.add('dark')
      } else {
        document.documentElement.classList.remove('dark')
      }
    }
  }, [preferences.theme])

  function showMessage(text: string) {
    setMessage(text)
    setError('')

    setTimeout(() => {
      setMessage('')
    }, 3000)
  }

  function showError(text: string) {
    setError(text)
    setMessage('')

    setTimeout(() => {
      setError('')
    }, 3000)
  }

  function handleProfileSave() {
    if (!name.trim() || !email.trim()) {
      showError('Name and email cannot be empty.')
      return
    }

    setSavedName(name)
    setSavedEmail(email)

    showMessage('Account information saved successfully.')
  }

  function handleProfileCancel() {
    setName(savedName)
    setEmail(savedEmail)

    showMessage('Account changes cancelled.')
  }

  function handlePasswordSave() {
    if (
      !currentPassword ||
      !newPassword ||
      !confirmPassword
    ) {
      showError('Please fill in all password fields.')
      return
    }

    if (newPassword.length < 6) {
      showError(
        'New password must be at least 6 characters long.',
      )
      return
    }

    if (newPassword !== confirmPassword) {
      showError('New passwords do not match.')
      return
    }

    setCurrentPassword('')
    setNewPassword('')
    setConfirmPassword('')

    showMessage('Password updated successfully.')
  }

  function handlePreferencesSave() {
    setSavedPreferences(preferences)

    showMessage('Preferences saved successfully.')
  }

  function handlePreferencesCancel() {
    setPreferences(savedPreferences)

    showMessage('Preference changes cancelled.')
  }

  function updatePreference<K extends keyof Preferences>(
    key: K,
    value: Preferences[K],
  ) {
    setPreferences((current) => ({
      ...current,
      [key]: value,
    }))
  }

  return (
    <div className="min-h-screen bg-muted/40 md:flex">
      {/* Sidebar */}
      <EmployerSidebar />

      {/* Main area */}
      <div className="min-w-0 flex-1">
        <EmployerHeader title="Settings" />

        <main className="mx-auto max-w-7xl space-y-6 p-4 sm:p-6">
          {/* Heading */}
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              Settings
            </h1>

            <p className="mt-1 text-sm text-muted-foreground">
              Manage your account, security, preferences, and
              notifications.
            </p>
          </div>

          {/* Success message */}
          {message && (
            <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
              {message}
            </div>
          )}

          {/* Error message */}
          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <div className="grid gap-6 lg:grid-cols-3">
            {/* Left column */}
            <div className="space-y-6 lg:col-span-2">
              {/* Account information */}
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <User className="h-5 w-5" />

                    <CardTitle>
                      Account Information
                    </CardTitle>
                  </div>
                </CardHeader>

                <CardContent className="space-y-5">
                  <div>
                    <label
                      htmlFor="name"
                      className="text-sm font-medium"
                    >
                      Name
                    </label>

                    <Input
                      id="name"
                      value={name}
                      onChange={(event) =>
                        setName(event.target.value)
                      }
                      className="mt-2"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="email"
                      className="text-sm font-medium"
                    >
                      Email Address
                    </label>

                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(event) =>
                        setEmail(event.target.value)
                      }
                      className="mt-2"
                    />
                  </div>

                  <div className="flex flex-col-reverse gap-3 border-t pt-5 sm:flex-row sm:justify-end">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleProfileCancel}
                    >
                      Cancel
                    </Button>

                    <Button
                      type="button"
                      onClick={handleProfileSave}
                    >
                      <Save className="mr-2 h-4 w-4" />
                      Save Changes
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Change password */}
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Lock className="h-5 w-5" />

                    <CardTitle>
                      Change Password
                    </CardTitle>
                  </div>
                </CardHeader>

                <CardContent className="space-y-5">
                  {/* Current password */}
                  <div>
                    <label
                      htmlFor="current-password"
                      className="text-sm font-medium"
                    >
                      Current Password
                    </label>

                    <div className="relative mt-2">
                      <Input
                        id="current-password"
                        type={
                          showCurrentPassword
                            ? 'text'
                            : 'password'
                        }
                        value={currentPassword}
                        onChange={(event) =>
                          setCurrentPassword(
                            event.target.value,
                          )
                        }
                        className="pr-10"
                      />

                      <button
                        type="button"
                        onClick={() =>
                          setShowCurrentPassword(
                            !showCurrentPassword,
                          )
                        }
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        aria-label="Show or hide current password"
                      >
                        {showCurrentPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* New password */}
                  <div>
                    <label
                      htmlFor="new-password"
                      className="text-sm font-medium"
                    >
                      New Password
                    </label>

                    <div className="relative mt-2">
                      <Input
                        id="new-password"
                        type={
                          showNewPassword
                            ? 'text'
                            : 'password'
                        }
                        value={newPassword}
                        onChange={(event) =>
                          setNewPassword(event.target.value)
                        }
                        className="pr-10"
                      />

                      <button
                        type="button"
                        onClick={() =>
                          setShowNewPassword(
                            !showNewPassword,
                          )
                        }
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        aria-label="Show or hide new password"
                      >
                        {showNewPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Confirm password */}
                  <div>
                    <label
                      htmlFor="confirm-password"
                      className="text-sm font-medium"
                    >
                      Confirm New Password
                    </label>

                    <div className="relative mt-2">
                      <Input
                        id="confirm-password"
                        type={
                          showConfirmPassword
                            ? 'text'
                            : 'password'
                        }
                        value={confirmPassword}
                        onChange={(event) =>
                          setConfirmPassword(
                            event.target.value,
                          )
                        }
                        className="pr-10"
                      />

                      <button
                        type="button"
                        onClick={() =>
                          setShowConfirmPassword(
                            !showConfirmPassword,
                          )
                        }
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        aria-label="Show or hide confirm password"
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>

                    <p className="mt-2 text-xs text-muted-foreground">
                      Password must contain at least 6 characters.
                    </p>
                  </div>

                  <div className="flex justify-end border-t pt-5">
                    <Button
                      type="button"
                      onClick={handlePasswordSave}
                    >
                      <Lock className="mr-2 h-4 w-4" />
                      Update Password
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Preferences */}
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Globe className="h-5 w-5" />

                    <CardTitle>
                      Account Preferences
                    </CardTitle>
                  </div>
                </CardHeader>

                <CardContent className="space-y-6">
                  {/* Theme */}
                  <div>
                    <div className="flex items-center gap-2">
                      <Sun className="h-4 w-4" />

                      <label className="text-sm font-medium">
                        Theme
                      </label>
                    </div>

                    <p className="mt-1 text-sm text-muted-foreground">
                      Choose how the Job Listing Platform appears.
                    </p>

                    <select
                      value={preferences.theme}
                      onChange={(event) =>
                        updatePreference(
                          'theme',
                          event.target.value as Theme,
                        )
                      }
                      className="mt-3 h-10 w-full rounded-md border bg-background px-3 text-sm sm:w-72"
                    >
                      <option value="light">
                        Light
                      </option>

                      <option value="dark">
                        Dark
                      </option>

                      <option value="system">
                        System Default
                      </option>
                    </select>
                  </div>

                  {/* Language */}
                  <div className="border-t pt-6">
                    <div className="flex items-center gap-2">
                      <Globe className="h-4 w-4" />

                      <label className="text-sm font-medium">
                        Language
                      </label>
                    </div>

                    <p className="mt-1 text-sm text-muted-foreground">
                      Choose your preferred display language.
                    </p>

                    <select
                      value={preferences.language}
                      onChange={(event) =>
                        updatePreference(
                          'language',
                          event.target.value,
                        )
                      }
                      className="mt-3 h-10 w-full rounded-md border bg-background px-3 text-sm sm:w-72"
                    >
                      <option>English</option>
                      <option>Amharic</option>
                      <option>Oromo</option>
                    </select>
                  </div>

                  <div className="flex flex-col-reverse gap-3 border-t pt-5 sm:flex-row sm:justify-end">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handlePreferencesCancel}
                    >
                      Cancel
                    </Button>

                    <Button
                      type="button"
                      onClick={handlePreferencesSave}
                    >
                      <Save className="mr-2 h-4 w-4" />
                      Save Preferences
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right column */}
            <div className="space-y-6">
              {/* Notification settings */}
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Bell className="h-5 w-5" />

                    <CardTitle>
                      Notifications
                    </CardTitle>
                  </div>
                </CardHeader>

                <CardContent className="space-y-5">
                  <label className="flex cursor-pointer items-start justify-between gap-4">
                    <div>
                      <p className="text-sm font-medium">
                        Email Notifications
                      </p>

                      <p className="mt-1 text-xs text-muted-foreground">
                        Receive important updates by email.
                      </p>
                    </div>

                    <input
                      type="checkbox"
                      checked={
                        preferences.emailNotifications
                      }
                      onChange={(event) =>
                        updatePreference(
                          'emailNotifications',
                          event.target.checked,
                        )
                      }
                      className="mt-1 h-4 w-4"
                    />
                  </label>

                  <label className="flex cursor-pointer items-start justify-between gap-4 border-t pt-5">
                    <div>
                      <p className="text-sm font-medium">
                        New Applications
                      </p>

                      <p className="mt-1 text-xs text-muted-foreground">
                        Get notified when someone applies to a job.
                      </p>
                    </div>

                    <input
                      type="checkbox"
                      checked={
                        preferences.applicationNotifications
                      }
                      onChange={(event) =>
                        updatePreference(
                          'applicationNotifications',
                          event.target.checked,
                        )
                      }
                      className="mt-1 h-4 w-4"
                    />
                  </label>

                  <label className="flex cursor-pointer items-start justify-between gap-4 border-t pt-5">
                    <div>
                      <p className="text-sm font-medium">
                        Job Updates
                      </p>

                      <p className="mt-1 text-xs text-muted-foreground">
                        Receive updates about your job posts.
                      </p>
                    </div>

                    <input
                      type="checkbox"
                      checked={
                        preferences.jobNotifications
                      }
                      onChange={(event) =>
                        updatePreference(
                          'jobNotifications',
                          event.target.checked,
                        )
                      }
                      className="mt-1 h-4 w-4"
                    />
                  </label>

                  <Button
                    type="button"
                    className="w-full"
                    onClick={handlePreferencesSave}
                  >
                    <Save className="mr-2 h-4 w-4" />
                    Save Notifications
                  </Button>
                </CardContent>
              </Card>

              {/* Theme information */}
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    {preferences.theme === 'dark' ? (
                      <Moon className="h-5 w-5" />
                    ) : (
                      <Sun className="h-5 w-5" />
                    )}

                    <CardTitle>
                      Current Appearance
                    </CardTitle>
                  </div>
                </CardHeader>

                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Current theme:
                  </p>

                  <p className="mt-1 font-semibold capitalize">
                    {preferences.theme === 'system'
                      ? 'System Default'
                      : preferences.theme}
                  </p>

                  <p className="mt-4 text-sm text-muted-foreground">
                    Your appearance preference is applied
                    immediately when you select a new theme.
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

