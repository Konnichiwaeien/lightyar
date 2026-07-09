'use client'

import { useEffect, useState } from 'react'

/**
 * Russian pluralization for "день" (day).
 * Rules: 1 → день, 2-4 → дня, 5-20 → дней, 21 → день, 22-24 → дня, etc.
 */
function pluralizeDays(n: number): string {
  const abs = Math.abs(n)
  const mod10 = abs % 10
  const mod100 = abs % 100

  if (mod100 >= 11 && mod100 <= 19) return 'ДНЕЙ'
  if (mod10 === 1) return 'ДЕНЬ'
  if (mod10 >= 2 && mod10 <= 4) return 'ДНЯ'
  return 'ДНЕЙ'
}

interface CampaignCountdownProps {
  deadline: string | null
}

export function CampaignCountdown({ deadline }: CampaignCountdownProps) {
  const [daysRemaining, setDaysRemaining] = useState<number | null>(null)

  useEffect(() => {
    if (!deadline) return

    function calculate() {
      const now = new Date()
      const end = new Date(deadline!)
      const diffMs = end.getTime() - now.getTime()

      if (diffMs <= 0) {
        setDaysRemaining(null)
        return
      }

      setDaysRemaining(Math.ceil(diffMs / (1000 * 60 * 60 * 24)))
    }

    calculate()

    const interval = setInterval(calculate, 60_000)
    return () => clearInterval(interval)
  }, [deadline])

  if (daysRemaining === null) return null

  const isUrgent = daysRemaining <= 3
  const label =
    daysRemaining <= 1
      ? 'ПОСЛЕДНИЙ ДЕНЬ!'
      : `ОСТАЛОСЬ ${daysRemaining} ${pluralizeDays(daysRemaining)}`

  return (
    <span
      className={`
        inline-flex items-center gap-1.5
        rounded-full px-3.5 py-2
        text-[10px] md:text-xs font-extrabold tracking-widest uppercase
        border
        ${
          isUrgent
            ? 'bg-red-50 text-red-600 border-red-100/20'
            : 'bg-[#fdf0e9] text-[#d97706] border-[#d97706]/10'
        }
      `}
    >
      ⏳ {label}
    </span>
  )
}
