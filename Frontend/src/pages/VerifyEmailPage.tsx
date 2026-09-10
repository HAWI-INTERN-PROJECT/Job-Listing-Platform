import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { useAuthStore } from '@/stores/auth'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { OtpInput } from '@/components/ui/otp-input'
import { ResendTimer } from '@/components/ui/resend-timer'
import api from '@/lib/api'

export default function VerifyEmailPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { user, getProfile, logout } = useAuthStore()

  const [code, setCode] = useState('')
  const [error, setError] = useState(false)

  const verifyMutation = useMutation({
    mutationFn: (submittedCode: string) => api.post('/email/verify-otp', { code: submittedCode }),
    onSuccess: async () => {
      toast.success(t('auth.emailVerified', 'Email verified successfully'))
      await getProfile()
      if (user?.role === 'employer') {
        navigate('/employer-dashboard')
      } else {
        navigate('/dashboard')
      }
    },
    onError: () => {
      setError(true)
      toast.error(t('otp.invalidCode'))
    },
  })

  const resendMutation = useMutation({
    mutationFn: () => api.post('/email/resend'),
  })

  const handleComplete = (submittedCode: string) => {
    verifyMutation.mutate(submittedCode)
  }

  const handleResend = async () => {
    await resendMutation.mutateAsync()
    setCode('')
    setError(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/40 py-8 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">{t('otp.registerTitle')}</CardTitle>
          <CardDescription>
            {t('otp.codeSentTo', { email: user?.email ?? '' })}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <OtpInput
            value={code}
            onChange={setCode}
            onComplete={handleComplete}
            disabled={verifyMutation.isPending}
            error={error}
          />
          <ResendTimer onResend={handleResend} />
          <button
            type="button"
            onClick={() => logout()}
            className="text-sm text-muted-foreground hover:underline w-full text-center"
          >
            {t('auth.logout')}
          </button>
        </CardContent>
      </Card>
    </div>
  )
}
