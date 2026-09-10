import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import axios from 'axios'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { OtpInput } from '@/components/ui/otp-input'
import { ResendTimer } from '@/components/ui/resend-timer'
import api from '@/lib/api'

export default function ResetPasswordPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const location = useLocation()
  const emailFromState = (location.state as { email?: string } | null)?.email ?? ''

  const [email, setEmail] = useState(emailFromState)
  const [code, setCode] = useState('')
  const [password, setPassword] = useState('')
  const [passwordConfirmation, setPasswordConfirmation] = useState('')
  const [error, setError] = useState('')
  const [otpError, setOtpError] = useState(false)

  const resetMutation = useMutation({
    mutationFn: () => api.post('/reset-password', {
      email,
      code,
      password,
      password_confirmation: passwordConfirmation,
    }),
    onSuccess: () => {
      toast.success(t('passwords.reset', 'Your password has been reset.'))
      navigate('/login')
    },
    onError: (err: unknown) => {
      setOtpError(true)
      if (axios.isAxiosError(err) && err.response?.data) {
        const msg = err.response.data.message ?? 'Failed to reset password'
        setError(msg)
        toast.error(msg)
        return
      }
      setError('Failed to reset password')
    },
  })

  const resendMutation = useMutation({
    mutationFn: () => api.post('/forgot-password', { email }),
  })

  const handleResend = async () => {
    await resendMutation.mutateAsync()
    setCode('')
    setOtpError(false)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!email) {
      setError(t('auth.emailRequired'))
      return
    }
    if (code.length !== 6) {
      setError(t('otp.invalidCode'))
      return
    }
    if (password !== passwordConfirmation) {
      setError(t('auth.passwordMatch'))
      return
    }
    resetMutation.mutate()
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/40 py-8 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">{t('otp.forgotPasswordTitle')}</CardTitle>
          <CardDescription>{t('otp.forgotPasswordDescription')}</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {!emailFromState && (
              <div className="space-y-2">
                <Label htmlFor="email">{t('auth.email')}</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="john@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            )}

            <div className="space-y-2">
              <Label className="block text-center">{t('otp.codeSentTo', { email })}</Label>
              <OtpInput
                value={code}
                onChange={setCode}
                disabled={resetMutation.isPending}
                error={otpError}
              />
              <ResendTimer onResend={handleResend} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">{t('otp.newPassword')}</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password_confirmation">{t('otp.confirmNewPassword')}</Label>
              <Input
                id="password_confirmation"
                type="password"
                placeholder="••••••••"
                value={passwordConfirmation}
                onChange={(e) => setPasswordConfirmation(e.target.value)}
                required
              />
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button type="submit" className="w-full" disabled={resetMutation.isPending}>
              {resetMutation.isPending ? t('common.loading') : t('passwords.reset', 'Reset password')}
            </Button>
            <p className="text-sm text-muted-foreground">
              <Link to="/login" className="text-primary underline-offset-4 hover:underline">
                {t('auth.backToLogin', 'Back to login')}
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
