import { NextResponse } from 'next/server'
import { redis, KEYS } from '@/lib/redis'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const year = parseInt(searchParams.get('year') || new Date().getFullYear().toString())
    const month = parseInt(searchParams.get('month') || (new Date().getMonth() + 1).toString())
    
    // Get all days in the month
    const daysInMonth = new Date(year, month, 0).getDate()
    const history: Record<string, number> = {}
    
    // Batch fetch all days' counts
    const promises = []
    for (let day = 1; day <= daysInMonth; day++) {
      const dateKey = `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`
      promises.push(
        redis.scard(KEYS.dailyUsers(dateKey)).then(count => {
          if (count > 0) {
            history[dateKey] = count
          }
        })
      )
    }
    
    await Promise.all(promises)
    
    // Calculate summary stats
    const counts = Object.values(history)
    const total = counts.reduce((a, b) => a + b, 0)
    const activeNights = counts.length
    const bestNight = counts.length > 0 ? Math.max(...counts) : 0
    
    return NextResponse.json({
      year,
      month,
      history,
      summary: {
        total,
        activeNights,
        bestNight,
      },
    })
  } catch (error) {
    console.error('History error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch history' },
      { status: 500 }
    )
  }
}
