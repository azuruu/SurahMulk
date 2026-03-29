'use client'

import { useState, useEffect, useCallback } from 'react'
import useSWR, { mutate } from 'swr'
import { MapPin } from 'lucide-react'
import { CheckinCard } from '@/components/checkin-card'
import { StatCard } from '@/components/stat-card'
import { WorldMap } from '@/components/world-map'
import { Leaderboard } from '@/components/leaderboard'
import { CalendarHeatmap } from '@/components/calendar-heatmap'
import { CountryPicker } from '@/components/country-picker'
import { countryByCode } from '@/lib/countries'

// Generate anonymous user ID
function getOrCreateUserId(): string {
  if (typeof window === 'undefined') return ''
  let userId = localStorage.getItem('mulk_user_id')
  if (!userId) {
    userId = `user_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`
    localStorage.setItem('mulk_user_id', userId)
  }
  return userId
}

// Get/set selected country
function getSelectedCountry(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('mulk_country')
}

function setSelectedCountry(code: string): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem('mulk_country', code)
  }
}

const fetcher = (url: string) => fetch(url).then(res => res.json())

interface Stats {
  tonight: number
  lastNight: number
  countries: number
  countryData: Record<string, number>
  checkedInToday: boolean
  streak: number
  date: string
}

interface HistoryData {
  year: number
  month: number
  history: Record<string, number>
  summary: {
    total: number
    activeNights: number
    bestNight: number
  }
}

export default function Home() {
  const [userId, setUserId] = useState<string>('')
  const [countryCode, setCountryCode] = useState<string | null>(null)
  const [showCountryPicker, setShowCountryPicker] = useState(false)
  const [activeTab, setActiveTab] = useState<'map' | 'history'>('map')
  const [historyDate, setHistoryDate] = useState(() => {
    const now = new Date()
    return { year: now.getFullYear(), month: now.getMonth() + 1 }
  })

  // Initialize user ID and country on mount
  useEffect(() => {
    const id = getOrCreateUserId()
    setUserId(id)
    
    const country = getSelectedCountry()
    if (country) {
      setCountryCode(country)
    } else {
      setShowCountryPicker(true)
    }
  }, [])

  // Fetch stats - refresh every 10 seconds to show others' check-ins
  const { data: stats, error: statsError, mutate: mutateStats } = useSWR<Stats>(
    userId ? `/api/stats?userId=${userId}` : null,
    fetcher,
    { 
      refreshInterval: 10000,
      revalidateOnFocus: true,
    }
  )

  // Fetch history
  const { data: history } = useSWR<HistoryData>(
    `/api/history?year=${historyDate.year}&month=${historyDate.month}`,
    fetcher
  )

  const handleCountrySelect = (code: string) => {
    setCountryCode(code)
    setSelectedCountry(code)
    setShowCountryPicker(false)
  }

  const handleCheckin = useCallback(async (): Promise<{ success: boolean; streak: number }> => {
    if (!userId || !countryCode) {
      return { success: false, streak: 0 }
    }

    // Optimistic update
    mutate(
      `/api/stats?userId=${userId}`,
      (currentData: Stats | undefined) => {
        if (!currentData) return currentData
        const newCountryData = { ...currentData.countryData }
        newCountryData[countryCode] = (newCountryData[countryCode] || 0) + 1
        return {
          ...currentData,
          tonight: currentData.tonight + 1,
          countries: Object.keys(newCountryData).length,
          countryData: newCountryData,
          checkedInToday: true,
          streak: currentData.streak + 1,
        }
      },
      false
    )

    try {
      const response = await fetch('/api/checkin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, countryCode }),
      })
      
      const data = await response.json()
      
      if (data.success) {
        // Revalidate to get accurate server data
        mutate(`/api/stats?userId=${userId}`)
        mutate(`/api/history?year=${historyDate.year}&month=${historyDate.month}`)
        return { success: true, streak: data.streak }
      }
      
      // Revert on failure
      mutate(`/api/stats?userId=${userId}`)
      return { success: false, streak: 0 }
    } catch (error) {
      console.error('Check-in error:', error)
      mutate(`/api/stats?userId=${userId}`)
      return { success: false, streak: 0 }
    }
  }, [userId, countryCode, historyDate.year, historyDate.month])

  const handlePrevMonth = () => {
    setHistoryDate(prev => {
      if (prev.month === 1) {
        return { year: prev.year - 1, month: 12 }
      }
      return { year: prev.year, month: prev.month - 1 }
    })
  }

  const handleNextMonth = () => {
    const now = new Date()
    const currentYear = now.getFullYear()
    const currentMonth = now.getMonth() + 1
    
    setHistoryDate(prev => {
      if (prev.year === currentYear && prev.month === currentMonth) {
        return prev
      }
      if (prev.month === 12) {
        return { year: prev.year + 1, month: 1 }
      }
      return { year: prev.year, month: prev.month + 1 }
    })
  }

  const countryName = countryCode ? countryByCode.get(countryCode)?.name : null

  if (statsError) {
    console.error('Stats error:', statsError)
  }

  return (
    <main className="min-h-screen bg-[#0a0a0a]">
      {/* Top Bar */}
      <header className="border-b border-[rgba(255,255,255,0.04)] px-4 lg:px-8 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl" style={{ fontFamily: 'var(--font-arabic)' }}>
              سورة الملك
            </span>
            <span className="text-[#555] text-sm hidden sm:inline">
              Surah Al-Mulk Tracker
            </span>
          </div>
          
          <button
            onClick={() => setShowCountryPicker(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-full border border-[rgba(255,255,255,0.1)] hover:border-[rgba(255,255,255,0.2)] transition-colors text-sm"
          >
            <MapPin className="w-4 h-4 text-[#4ade80]" />
            <span className="text-white">{countryName || 'Select Country'}</span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        <div className="flex flex-col lg:flex-row gap-4 sm:gap-6 lg:gap-8">
          {/* Left Column */}
          <div className="w-full lg:w-[360px] lg:flex-shrink-0 space-y-4 sm:space-y-6">
            <CheckinCard
              onCheckin={handleCheckin}
              checkedIn={stats?.checkedInToday || false}
              streak={stats?.streak || 0}
            />
            
            <div className="grid grid-cols-3 gap-3">
              <StatCard
                label="Tonight"
                value={stats?.tonight || 0}
                isLive
                delay={0.1}
              />
              <StatCard
                label="Last Night"
                value={stats?.lastNight || 0}
                delay={0.2}
              />
              <StatCard
                label="Countries"
                value={stats?.countries || 0}
                delay={0.3}
              />
            </div>
          </div>

          {/* Right Column */}
          <div className="flex-1 min-w-0">
            {/* Tabs and Inspirational Text */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-6">
              <div className="flex gap-1 p-1 bg-[#141414] rounded-xl w-fit border border-[rgba(255,255,255,0.04)]">
                <button
                  onClick={() => setActiveTab('map')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    activeTab === 'map'
                      ? 'bg-[rgba(255,255,255,0.1)] text-white'
                      : 'text-[#666] hover:text-white'
                  }`}
                >
                  World Map
                </button>
                <button
                  onClick={() => setActiveTab('history')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    activeTab === 'history'
                      ? 'bg-[rgba(255,255,255,0.1)] text-white'
                      : 'text-[#666] hover:text-white'
                  }`}
                >
                  History
                </button>
              </div>
              
              <p className="hidden sm:block text-xs text-[#555] leading-relaxed max-w-md">
                Every check-in is a ripple, your good action tonight encourages another, until the whole Ummah is activated.
              </p>
            </div>

            {/* Tab Content */}
            <div className="bg-[#141414] border border-[rgba(255,255,255,0.04)] rounded-xl sm:rounded-2xl p-4 sm:p-6 opacity-0 animate-fade-up" style={{ animationDelay: '0.2s' }}>
              {activeTab === 'map' ? (
                <>
                  <WorldMap 
                    countryData={stats?.countryData || {}} 
                    userCountry={countryCode || undefined}
                    hasRecitedTonight={stats?.checkedInToday || false}
                  />
                  <Leaderboard countryData={stats?.countryData || {}} />
                </>
              ) : (
                <CalendarHeatmap
                  year={historyDate.year}
                  month={historyDate.month}
                  history={history?.history || {}}
                  summary={history?.summary || { total: 0, activeNights: 0, bestNight: 0 }}
                  onPrevMonth={handlePrevMonth}
                  onNextMonth={handleNextMonth}
                />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Country Picker Modal */}
      <CountryPicker
        isOpen={showCountryPicker}
        onSelect={handleCountrySelect}
      />
    </main>
  )
}
