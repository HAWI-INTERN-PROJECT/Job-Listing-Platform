import React, { useState, useEffect } from 'react'
import { Clock, Radio } from 'lucide-react'

interface InterviewCountdownProps {
  scheduledAt: string
  durationMinutes?: number
  variant?: 'compact' | 'badge' | 'card'
  className?: string
}

interface TimeRemaining {
  days: number
  hours: number
  minutes: number
  seconds: number
  isPast: boolean
  isLive: boolean
  totalSeconds: number
}

function calculateTimeRemaining(scheduledAt: string, durationMinutes: number = 45): TimeRemaining {
  const target = new Date(scheduledAt).getTime()
  const now = new Date().getTime()
  const diffMs = target - now
  const durationMs = durationMinutes * 60 * 1000

  // Check if happening right now
  const isLive = diffMs <= 0 && Math.abs(diffMs) < durationMs
  const isPast = diffMs < 0 && !isLive

  if (diffMs <= 0) {
    return {
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
      isPast,
      isLive,
      totalSeconds: 0,
    }
  }

  const totalSeconds = Math.floor(diffMs / 1000)
  const days = Math.floor(totalSeconds / 86400)
  const hours = Math.floor((totalSeconds % 86400) / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60

  return {
    days,
    hours,
    minutes,
    seconds,
    isPast: false,
    isLive: false,
    totalSeconds,
  }
}

export const InterviewCountdown: React.FC<InterviewCountdownProps> = ({
  scheduledAt,
  durationMinutes = 45,
  variant = 'badge',
  className = '',
}) => {
  const [timeLeft, setTimeLeft] = useState<TimeRemaining>(() =>
    calculateTimeRemaining(scheduledAt, durationMinutes),
  )

  useEffect(() => {
    // Initial sync
    setTimeLeft(calculateTimeRemaining(scheduledAt, durationMinutes))

    const interval = setInterval(() => {
      setTimeLeft(calculateTimeRemaining(scheduledAt, durationMinutes))
    }, 1000)

    return () => clearInterval(interval)
  }, [scheduledAt, durationMinutes])

  if (timeLeft.isLive) {
    return (
      <span
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 animate-pulse ${className}`}
      >
        <Radio className="w-3.5 h-3.5 text-emerald-500 animate-spin" />
        <span>Interview In Progress Now</span>
      </span>
    )
  }

  if (timeLeft.isPast) {
    return (
      <span
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-muted text-muted-foreground border border-border/60 ${className}`}
      >
        <Clock className="w-3.5 h-3.5" />
        <span>Interview Concluded</span>
      </span>
    )
  }

  // Card view with digital counter boxes
  if (variant === 'card') {
    return (
      <div className={`flex items-center gap-2 text-center select-none ${className}`}>
        {timeLeft.days > 0 && (
          <div className="flex flex-col items-center bg-background/90 dark:bg-muted/80 border border-border rounded-lg px-2.5 py-1.5 min-w-[50px] shadow-sm">
            <span className="text-base font-bold text-foreground font-mono leading-none">
              {timeLeft.days}
            </span>
            <span className="text-[10px] text-muted-foreground uppercase tracking-wider mt-0.5">
              days
            </span>
          </div>
        )}
        <div className="flex flex-col items-center bg-background/90 dark:bg-muted/80 border border-border rounded-lg px-2.5 py-1.5 min-w-[50px] shadow-sm">
          <span className="text-base font-bold text-foreground font-mono leading-none">
            {String(timeLeft.hours).padStart(2, '0')}
          </span>
          <span className="text-[10px] text-muted-foreground uppercase tracking-wider mt-0.5">
            hrs
          </span>
        </div>
        <span className="font-mono font-bold text-muted-foreground/60">:</span>
        <div className="flex flex-col items-center bg-background/90 dark:bg-muted/80 border border-border rounded-lg px-2.5 py-1.5 min-w-[50px] shadow-sm">
          <span className="text-base font-bold text-foreground font-mono leading-none">
            {String(timeLeft.minutes).padStart(2, '0')}
          </span>
          <span className="text-[10px] text-muted-foreground uppercase tracking-wider mt-0.5">
            mins
          </span>
        </div>
        <span className="font-mono font-bold text-muted-foreground/60">:</span>
        <div className="flex flex-col items-center bg-background/90 dark:bg-muted/80 border border-border rounded-lg px-2.5 py-1.5 min-w-[50px] shadow-sm">
          <span className="text-base font-bold text-purple-600 dark:text-purple-400 font-mono leading-none">
            {String(timeLeft.seconds).padStart(2, '0')}
          </span>
          <span className="text-[10px] text-muted-foreground uppercase tracking-wider mt-0.5">
            secs
          </span>
        </div>
      </div>
    )
  }

  // Compact variant (inline text)
  if (variant === 'compact') {
    return (
      <span className={`inline-flex items-center gap-1 font-mono text-xs ${className}`}>
        <Clock className="w-3 h-3 text-purple-500" />
        {timeLeft.days > 0 ? `${timeLeft.days}d ` : ''}
        {String(timeLeft.hours).padStart(2, '0')}:{String(timeLeft.minutes).padStart(2, '0')}:
        {String(timeLeft.seconds).padStart(2, '0')}
      </span>
    )
  }

  // Default Badge variant
  const isUrgent = timeLeft.totalSeconds < 3600 // Less than 1 hour
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
        isUrgent
          ? 'bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/30'
          : 'bg-purple-500/15 text-purple-700 dark:text-purple-300 border border-purple-500/30'
      } ${className}`}
    >
      <Clock className={`w-3.5 h-3.5 ${isUrgent ? 'animate-pulse text-amber-500' : 'text-purple-500'}`} />
      <span>
        {isUrgent ? 'Starting in ' : 'In '}
        {timeLeft.days > 0 ? `${timeLeft.days}d ` : ''}
        {String(timeLeft.hours).padStart(2, '0')}h {String(timeLeft.minutes).padStart(2, '0')}m {String(timeLeft.seconds).padStart(2, '0')}s
      </span>
    </span>
  )
}
export default InterviewCountdown
