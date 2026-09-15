import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { Eye, EyeOff } from 'lucide-react'
import { toast } from 'sonner'
import { useAuthStore } from '@/stores/auth'
import EmployerSidebar from '@/components/employer/EmployerSidebar'
import EmployeeSidebar from '@/components/employee/EmployeeSidebar'
import EmployerHeader from '@/components/employer/EmployerHeader'
import { ThemeToggle } from '@/components/ThemeToggle'
import { LanguageSwitcher } from '@/components/LanguageSwitcher'
import { OtpInput } from '@/components/ui/otp-input'
import { ResendTimer } from '@/components/ui/resend-timer'
import api from '@/lib/api'

function PasswordField({
  label,
  value,
  onChange,
}: {
  label: string
  value: string
  onChange: (v: string) => void
}) {
  const [show, setShow] = useState(false)
  return (
    <div>
      <label className="text-xs font-medium text-muted-foreground block mb-1.5">{label}</label>
      <div className="relative">
        <input
          type={show ? 'text' : 'password'}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full px-3 py-2 pr-10 text-xs rounded-lg border border-border/80 bg-background text-foreground focus:outline-none focus:border-foreground/40 focus:ring-1 focus:ring-foreground/20 transition-all"
        />
        <button
          type="button"
          onClick={() => setShow((v) => !v)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors p-0.5"
          aria-label={show ? 'Hide password' : 'Show password'}
        >
          {show ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
        </button>
      </div>
    </div>
  )
}

export default function SettingsPage() {
  const { t } = useTranslation()
  const { user } = useAuthStore()
  const Sidebar = user?.role === 'employer' ? EmployerSidebar : EmployeeSidebar

  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [pwError, setPwError] = useState('')

  const [awaitingOtp, setAwaitingOtp] = useState(false)
  const [otpCode, setOtpCode] = useState('')
  const [otpError, setOtpError] = useState(false)

  const requestChangeMutation = useMutation({
    mutationFn: (data: { current_password: string; password: string; password_confirmation: string }) =>
      api.put('/change-password', data),
    onSuccess: () => {
      setAwaitingOtp(true)
      setOtpError(false)
      toast.success(t('otp.codeSentTo', { email: user?.email ?? '' }))
    },
    onError: (error: any) => {
      const msg =
        error.response?.data?.errors?.current_password?.[0] ??
        error.response?.data?.message ??
        'Failed to update password'
      setPwError(msg)
      toast.error(msg)
    },
  })

  const confirmChangeMutation = useMutation({
    mutationFn: (code: string) => api.post('/confirm-change-password', { code }),
    onSuccess: () => {
      toast.success(t('settings.passwordUpdated'))
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
      setPwError('')
      setAwaitingOtp(false)
      setOtpCode('')
      setOtpError(false)
    },
    onError: () => {
      setOtpError(true)
      toast.error(t('otp.invalidCode'))
    },
  })

  const handlePasswordSave = () => {
    setPwError('')
    if (!currentPassword || !newPassword || !confirmPassword) {
      setPwError(t('settings.allFieldsRequired'))
      return
    }
    if (newPassword.length < 8) {
      setPwError(t('settings.passwordMinLength'))
      return
    }
    if (newPassword !== confirmPassword) {
      setPwError(t('settings.passwordsNoMatch'))
      return
    }
    requestChangeMutation.mutate({
      current_password: currentPassword,
      password: newPassword,
      password_confirmation: confirmPassword,
    })
  }

  const handleOtpComplete = (code: string) => {
    confirmChangeMutation.mutate(code)
  }

  const handleResendOtp = () => {
    requestChangeMutation.mutate({
      current_password: currentPassword,
      password: newPassword,
      password_confirmation: confirmPassword,
    })
  }

  const handleCancelOtp = () => {
    setAwaitingOtp(false)
    setOtpCode('')
    setOtpError(false)
  }

  const sectionCls = 'bg-card border border-border/70 rounded-xl p-5 sm:p-6 shadow-xs space-y-4'

  return (
    <div className="h-screen flex overflow-hidden bg-background">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto pt-14 md:pt-0">
        <EmployerHeader title={t('settings.title')} />

        <main className="w-full px-4 sm:px-6 lg:px-8 py-8 space-y-6">
          {/* Notion Header */}
          <div className="border-b border-border/60 pb-5 space-y-1.5">
            <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium">
              <span className="inline-flex items-center justify-center h-5 w-5 rounded bg-muted text-foreground text-[11px] font-semibold">
                ⚙️
              </span>
              <span>Preferences & Security</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              {t('settings.title')}
            </h1>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Manage your account identity, authentication credentials, and display preferences.
            </p>
          </div>

          {/* Account Overview */}
          <section className={sectionCls}>
            <div className="flex items-center gap-2 border-b border-border/50 pb-3">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {t('settings.account')}
              </h2>
            </div>
            <div className="flex items-center gap-4 pt-1">
              <div className="h-12 w-12 rounded-xl bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 flex items-center justify-center text-lg font-bold flex-shrink-0 shadow-xs">
                {user?.name?.[0]?.toUpperCase() ?? 'U'}
              </div>
              <div className="space-y-0.5">
                <p className="font-semibold text-sm text-foreground">{user?.name ?? '—'}</p>
                <p className="text-xs text-muted-foreground font-mono">{user?.email ?? '—'}</p>
                <span className="inline-block text-[10px] font-medium uppercase tracking-wide text-muted-foreground bg-muted px-2 py-0.5 rounded-md mt-1">
                  {user?.role_label ?? user?.role ?? '—'}
                </span>
              </div>
            </div>
          </section>

          {/* Change Password */}
          <section className={sectionCls}>
            <div className="flex items-center gap-2 border-b border-border/50 pb-3">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {t('settings.changePassword')}
              </h2>
            </div>

            {!awaitingOtp ? (
              <div className="space-y-4 pt-1">
                <div className="space-y-3">
                  <PasswordField
                    label={t('settings.currentPassword')}
                    value={currentPassword}
                    onChange={setCurrentPassword}
                  />
                  <PasswordField
                    label={t('settings.newPassword')}
                    value={newPassword}
                    onChange={setNewPassword}
                  />
                  <PasswordField
                    label={t('settings.confirmNewPassword')}
                    value={confirmPassword}
                    onChange={setConfirmPassword}
                  />
                </div>

                {pwError && (
                  <p className="text-xs text-rose-600 dark:text-rose-400 bg-rose-500/10 border border-rose-200 dark:border-rose-900/40 rounded-lg p-2.5">
                    {pwError}
                  </p>
                )}

                <div className="flex justify-end pt-2">
                  <button
                    type="button"
                    onClick={handlePasswordSave}
                    disabled={requestChangeMutation.isPending}
                    className="px-4 py-2 text-xs font-medium rounded-lg bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 hover:opacity-90 disabled:opacity-50 transition-opacity"
                  >
                    {requestChangeMutation.isPending
                      ? t('settings.saving')
                      : t('settings.updatePassword')}
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4 pt-1">
                <p className="text-xs text-muted-foreground text-center leading-relaxed">
                  {t('otp.changePasswordDescription')}
                </p>
                <div className="flex justify-center py-2">
                  <OtpInput
                    value={otpCode}
                    onChange={setOtpCode}
                    onComplete={handleOtpComplete}
                    disabled={confirmChangeMutation.isPending}
                    error={otpError}
                  />
                </div>
                <ResendTimer onResend={handleResendOtp} />
                <div className="flex gap-2.5 justify-end pt-2 border-t border-border/50">
                  <button
                    type="button"
                    onClick={handleCancelOtp}
                    className="px-4 py-2 text-xs font-medium rounded-lg border border-border hover:bg-muted/70 transition-colors text-foreground"
                  >
                    {t('common.cancel')}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleOtpComplete(otpCode)}
                    disabled={confirmChangeMutation.isPending}
                    className="px-4 py-2 text-xs font-medium rounded-lg bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 hover:opacity-90 disabled:opacity-50 transition-opacity"
                  >
                    {confirmChangeMutation.isPending ? t('settings.saving') : t('common.confirm')}
                  </button>
                </div>
              </div>
            )}
          </section>

          {/* Appearance */}
          <section className={sectionCls}>
            <div className="flex items-center gap-2 border-b border-border/50 pb-3">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {t('settings.appearance')}
              </h2>
            </div>
            <div className="flex items-center justify-between pt-1">
              <div>
                <p className="text-xs font-semibold text-foreground">{t('settings.theme')}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{t('settings.themeDesc')}</p>
              </div>
              <ThemeToggle />
            </div>
          </section>

          {/* Language */}
          <section className={sectionCls}>
            <div className="flex items-center gap-2 border-b border-border/50 pb-3">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {t('settings.language')}
              </h2>
            </div>
            <div className="flex items-center justify-between pt-1">
              <div>
                <p className="text-xs font-semibold text-foreground">
                  {t('settings.displayLanguage')}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {t('settings.languageDesc')}
                </p>
              </div>
              <LanguageSwitcher />
            </div>
          </section>
        </main>
      </div>
    </div>
  )
}
