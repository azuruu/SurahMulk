'use client'

import { useState, useMemo } from 'react'
import { Search } from 'lucide-react'
import { countries } from '@/lib/countries'

interface CountryPickerProps {
  isOpen: boolean
  onSelect: (countryCode: string) => void
}

export function CountryPicker({ isOpen, onSelect }: CountryPickerProps) {
  const [search, setSearch] = useState('')

  const filteredCountries = useMemo(() => {
    if (!search) return countries
    const lower = search.toLowerCase()
    return countries.filter(c => c.name.toLowerCase().includes(lower))
  }, [search])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
      
      {/* Modal */}
      <div className="relative bg-[#141414] border border-[rgba(255,255,255,0.04)] rounded-2xl w-full max-w-md max-h-[80vh] flex flex-col animate-scale-in overflow-hidden">
        {/* Header */}
        <div className="p-6 pb-4 text-center border-b border-[rgba(255,255,255,0.04)]">
          <p className="text-2xl mb-2" style={{ fontFamily: 'var(--font-arabic)' }}>
            بسم الله الرحمن الرحيم
          </p>
          <h2 className="text-xl font-semibold text-white mt-4">Welcome</h2>
          <p className="text-[#666] text-sm mt-1">
            Select your country to join the global Surah Mulk tracker
          </p>
        </div>

        {/* Search */}
        <div className="px-6 py-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#555]" />
            <input
              type="text"
              placeholder="Search countries..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)] rounded-xl py-3 pl-10 pr-4 text-white placeholder:text-[#555] focus:outline-none focus:border-[#4ade80]/50 transition-colors"
            />
          </div>
        </div>

        {/* Country List */}
        <div className="flex-1 overflow-y-auto px-6 pb-6">
          <div className="space-y-1">
            {filteredCountries.map(country => (
              <button
                key={country.code}
                onClick={() => onSelect(country.code)}
                className="w-full text-left px-4 py-3 rounded-xl hover:bg-[rgba(255,255,255,0.05)] transition-colors group"
              >
                <span className="text-white group-hover:text-[#4ade80] transition-colors">
                  {country.name}
                </span>
              </button>
            ))}
            {filteredCountries.length === 0 && (
              <p className="text-center text-[#555] py-8">No countries found</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
