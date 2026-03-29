'use client'

import { useMemo } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface CalendarHeatmapProps {
  year: number
  month: number
  history: Record<string, number>
  summary: {
    total: number
    activeNights: number
    bestNight: number
  }
  onPrevMonth: () => void
  onNextMonth: () => void
}

const DAYS_OF_WEEK = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
]

export function CalendarHeatmap({
  year,
  month,
  history,
  summary,
  onPrevMonth,
  onNextMonth,
}: CalendarHeatmapProps) {
  const { weeks, maxCount } = useMemo(() => {
    const firstDay = new Date(year, month - 1, 1)
    const lastDay = new Date(year, month, 0)
    const daysInMonth = lastDay.getDate()
    const startDayOfWeek = firstDay.getDay()
    
    const weeks: (number | null)[][] = []
    let currentWeek: (number | null)[] = []
    
    // Add empty slots for days before the first day
    for (let i = 0; i < startDayOfWeek; i++) {
      currentWeek.push(null)
    }
    
    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      currentWeek.push(day)
      if (currentWeek.length === 7) {
        weeks.push(currentWeek)
        currentWeek = []
      }
    }
    
    // Add empty slots for remaining days
    while (currentWeek.length > 0 && currentWeek.length < 7) {
      currentWeek.push(null)
    }
    if (currentWeek.length > 0) {
      weeks.push(currentWeek)
    }
    
    const counts = Object.values(history)
    const maxCount = counts.length > 0 ? Math.max(...counts) : 1
    
    return { weeks, maxCount }
  }, [year, month, history])

  const getDateKey = (day: number) => {
    return `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`
  }

  const getCellColor = (day: number | null) => {
    if (day === null) return 'transparent'
    const count = history[getDateKey(day)] || 0
    if (count === 0) return 'rgba(255,255,255,0.04)'
    const intensity = count / maxCount
    if (intensity < 0.33) return 'rgba(74,222,128,0.25)'
    if (intensity < 0.66) return 'rgba(74,222,128,0.5)'
    return 'rgba(74,222,128,0.85)'
  }

  const isToday = (day: number | null) => {
    if (day === null) return false
    const today = new Date()
    return today.getFullYear() === year && today.getMonth() + 1 === month && today.getDate() === day
  }

  const canGoNext = () => {
    const today = new Date()
    return year < today.getFullYear() || (year === today.getFullYear() && month < today.getMonth() + 1)
  }

  return (
    <div>
      {/* Month Navigation */}
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <button
          onClick={onPrevMonth}
          className="p-1.5 sm:p-2 bg-[rgba(255,255,255,0.05)] hover:bg-[rgba(255,255,255,0.1)] rounded-lg transition-colors"
          aria-label="Previous month"
        >
          <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
        </button>
        <h3 className="text-base sm:text-lg font-medium text-white">
          {MONTH_NAMES[month - 1]} {year}
        </h3>
        <button
          onClick={onNextMonth}
          disabled={!canGoNext()}
          className="p-1.5 sm:p-2 bg-[rgba(255,255,255,0.05)] hover:bg-[rgba(255,255,255,0.1)] rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          aria-label="Next month"
        >
          <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
        </button>
      </div>

      {/* Days of Week Header */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {DAYS_OF_WEEK.map(day => (
          <div key={day} className="text-center text-[10px] font-mono text-[#555] uppercase tracking-wider">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="space-y-1">
        {weeks.map((week, weekIndex) => (
          <div key={weekIndex} className="grid grid-cols-7 gap-1">
            {week.map((day, dayIndex) => {
              const count = day ? (history[getDateKey(day)] || 0) : 0
              return (
                <div
                  key={dayIndex}
                  className={`aspect-square rounded-md flex flex-col items-center justify-center relative ${
                    isToday(day) ? 'ring-1 ring-[#4ade80]' : ''
                  }`}
                  style={{ backgroundColor: getCellColor(day) }}
                >
                  {day !== null && (
                    <>
                      <span className={`text-xs ${count > 0 ? 'text-white' : 'text-[#555]'}`}>
                        {day}
                      </span>
                      {count > 0 && (
                        <span className="text-[9px] font-mono text-[#4ade80]">
                          {count}
                        </span>
                      )}
                    </>
                  )}
                </div>
              )
            })}
          </div>
        ))}
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-2 sm:gap-4 mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-[rgba(255,255,255,0.04)]">
        <div className="text-center">
          <div className="font-mono text-lg sm:text-xl text-white">{summary.total.toLocaleString()}</div>
          <div className="text-[8px] sm:text-[10px] font-mono text-[#555] uppercase tracking-wider mt-1">Total</div>
        </div>
        <div className="text-center">
          <div className="font-mono text-lg sm:text-xl text-white">{summary.activeNights}</div>
          <div className="text-[8px] sm:text-[10px] font-mono text-[#555] uppercase tracking-wider mt-1">Active</div>
        </div>
        <div className="text-center">
          <div className="font-mono text-lg sm:text-xl text-[#4ade80]">{summary.bestNight.toLocaleString()}</div>
          <div className="text-[8px] sm:text-[10px] font-mono text-[#555] uppercase tracking-wider mt-1">Best</div>
        </div>
      </div>
    </div>
  )
}
