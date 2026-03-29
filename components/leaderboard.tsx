'use client'

import { useMemo } from 'react'
import { countryByCode } from '@/lib/countries'

interface LeaderboardProps {
  countryData: Record<string, number>
}

export function Leaderboard({ countryData }: LeaderboardProps) {
  const sortedCountries = useMemo(() => {
    return Object.entries(countryData)
      .map(([code, count]) => ({
        code,
        name: countryByCode.get(code)?.name || code,
        count,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10)
  }, [countryData])

  const maxCount = sortedCountries[0]?.count || 1

  if (sortedCountries.length === 0) {
    return (
      <div className="mt-6">
        <h3 className="font-mono text-[11px] tracking-[1.5px] uppercase text-[#444] mb-4">
          Top Countries Tonight
        </h3>
        <p className="text-[#555] text-sm">No check-ins yet tonight</p>
      </div>
    )
  }

  return (
    <div className="mt-4 sm:mt-6">
      <h3 className="font-mono text-[10px] sm:text-[11px] tracking-[1.5px] uppercase text-[#444] mb-3 sm:mb-4">
        Top Countries Tonight
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
        {sortedCountries.map((country, index) => (
          <div
            key={country.code}
            className="flex items-center gap-3 p-2 rounded-lg bg-[rgba(255,255,255,0.02)]"
          >
            <span className="font-mono text-[#555] text-xs w-5">
              {index + 1}.
            </span>
            <div className="flex-1 min-w-0">
              <div className="text-sm text-white truncate">{country.name}</div>
              <div className="mt-1 h-1.5 bg-[rgba(255,255,255,0.04)] rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#4ade80] rounded-full transition-all duration-500"
                  style={{ width: `${(country.count / maxCount) * 100}%` }}
                />
              </div>
            </div>
            <span className="font-mono text-[#4ade80] text-sm">
              {country.count}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
