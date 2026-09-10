import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import axios from 'axios'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import api from '@/lib/api'

export default function ForgotPasswordPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')

  const requestMutation = useMutation({
    mutationFn: () => api.post('/forgot-password', { email }),
    onSuccess: () => {
      toast.success(t('otp.codeSentTo', { email }))
      navigate('/reset-password', { state: { email } })
    },
    onError: (err: unknown) => {
      if (axios.isAxiosError(err) && err.response?.data) {
        const msg = err.response.data.errors?.email?.[0] ?? err.response.data.message ?? 'Failed to send code'
        setError(msg)
        toast.error(msg)
        return
      }
      setError('Failed to send code')
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    requestMutation.mutate()
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/40 py-8 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">{t('auth.forgotPassword', 'Forgot password?')}</CardTitle>
          <CardDescription>{t('auth.forgotPasswordDesc', "Enter your email and we'll send you a verification code.")}</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
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
              {error && <p className="text-sm text-destructive">{error}</p>}
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button type="submit" className="w-full" disabled={requestMutation.isPending}>
              {requestMutation.isPending ? t('common.loading') : t('otp.resendCode', 'Send code')}
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
