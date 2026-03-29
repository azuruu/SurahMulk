'use client'

import { useState, useEffect } from 'react'
import { Check } from 'lucide-react'

interface CheckinCardProps {
  onCheckin: () => Promise<{ success: boolean; streak: number }>
  checkedIn: boolean
  streak: number
}

export function CheckinCard({ onCheckin, checkedIn, streak }: CheckinCardProps) {
  const [isCheckedIn, setIsCheckedIn] = useState(checkedIn)
  const [currentStreak, setCurrentStreak] = useState(streak)
  const [isLoading, setIsLoading] = useState(false)
  const [showBlessing, setShowBlessing] = useState(false)

  useEffect(() => {
    setIsCheckedIn(checkedIn)
    setCurrentStreak(streak)
  }, [checkedIn, streak])

  const handleCheckin = async () => {
    if (isCheckedIn || isLoading) return
    
    setIsLoading(true)
    try {
      const result = await onCheckin()
      if (result.success) {
        setIsCheckedIn(true)
        setCurrentStreak(result.streak)
        setShowBlessing(true)
        setTimeout(() => setShowBlessing(false), 2500)
      }
    } catch (error) {
      console.error('Check-in failed:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="bg-[#141414] border border-[rgba(255,255,255,0.04)] rounded-xl sm:rounded-2xl p-4 sm:p-6 animate-fade-up">
      <div className="font-mono text-[10px] sm:text-[11px] tracking-[1.5px] uppercase text-[#3a3a3a] mb-2 sm:mb-3">
        Nightly Recitation
      </div>
      
      <h2 className="text-xl sm:text-2xl font-semibold text-white mb-3 sm:mb-4">Surah Al-Mulk</h2>
      
      <div className="border border-[rgba(255,255,255,0.08)] rounded-lg sm:rounded-xl p-3 sm:p-4 mb-4 sm:mb-6 bg-[rgba(255,255,255,0.02)]">
        <p className="text-sm text-[#888] leading-relaxed italic">
          &quot;There is a surah in the Quran which contains thirty ayat that will intercede for its companion until he is forgiven.&quot;
        </p>
        <p className="text-xs text-[#555] mt-2">— Tirmidhi</p>
      </div>

      {!isCheckedIn ? (
        <button
          onClick={handleCheckin}
          disabled={isLoading}
          className="w-full bg-white text-[#0a0a0a] font-medium py-3 sm:py-3.5 px-4 sm:px-6 rounded-lg sm:rounded-xl text-sm sm:text-base hover:bg-white/90 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Checking in...' : 'I recited Surah Mulk tonight'}
        </button>
      ) : (
        <div className="animate-scale-in">
          <div className="flex flex-col items-center text-center py-4">
            <div className="w-16 h-16 rounded-full bg-[#4ade80]/20 flex items-center justify-center mb-4">
              <svg
                className="w-8 h-8 text-[#4ade80]"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="20 6 9 17 4 12" className="animate-checkmark" />
              </svg>
            </div>
            <p className="text-white font-medium mb-1">Checked in tonight</p>
            {currentStreak > 1 && (
              <p className="text-[#4ade80] text-sm font-mono">
                {currentStreak} night streak
              </p>
            )}
            {showBlessing && (
              <p className="text-[#4ade80]/80 text-lg mt-3 font-[var(--font-arabic)] animate-fade-out" style={{ fontFamily: 'var(--font-arabic)' }}>
                بارك الله فيك
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
