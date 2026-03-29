'use client'

interface StatCardProps {
  label: string
  value: number
  isLive?: boolean
  delay?: number
}

export function StatCard({ label, value, isLive = false, delay = 0 }: StatCardProps) {
  return (
    <div 
      className="bg-[#141414] border border-[rgba(255,255,255,0.04)] rounded-lg sm:rounded-xl p-3 sm:p-4 opacity-0 animate-fade-up"
      style={{ animationDelay: `${delay}s` }}
    >
      <div className="flex items-center gap-1.5 sm:gap-2 mb-1 sm:mb-2">
        {isLive && (
          <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-[#4ade80] animate-pulse-dot" />
        )}
        <span className="font-mono text-[8px] sm:text-[10px] tracking-[1px] sm:tracking-[1.5px] uppercase text-[#444]">
          {label}
        </span>
      </div>
      <div className="font-mono text-xl sm:text-2xl font-light text-white">
        {value.toLocaleString()}
      </div>
    </div>
  )
}
