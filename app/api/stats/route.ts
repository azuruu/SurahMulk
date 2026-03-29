import { NextResponse } from 'next/server'
import { redis, getTodayKey, getYesterdayKey, KEYS } from '@/lib/redis'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    
    const today = getTodayKey()
    const yesterday = getYesterdayKey()
    
    console.log('[v0] Stats request - today:', today, 'yesterday:', yesterday)
    
    // Get today's stats
    const [todayCount, yesterdayCount, todayCountries] = await Promise.all([
      redis.scard(KEYS.dailyUsers(today)),
      redis.scard(KEYS.dailyUsers(yesterday)),
      redis.hgetall<Record<string, number>>(KEYS.dailyCountries(today)),
    ])
    
    console.log('[v0] Stats data:', { todayCount, yesterdayCount, todayCountries })
    
    // Count unique countries with check-ins today
    const uniqueCountriesCount = todayCountries ? Object.keys(todayCountries).length : 0
    
    // Check if user already checked in today and get their streak
    let checkedInToday = false
    let streak = 0
    
    if (userId) {
      checkedInToday = await redis.sismember(KEYS.dailyUsers(today), userId)
      if (checkedInToday) {
        streak = await redis.get<number>(KEYS.userStreak(userId)) || 0
      }
    }
    
    return NextResponse.json({
      tonight: todayCount || 0,
      lastNight: yesterdayCount || 0,
      countries: uniqueCountriesCount,
      countryData: todayCountries || {},
      checkedInToday,
      streak,
      date: today,
    })
  } catch (error) {
    console.error('Stats error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch stats' },
      { status: 500 }
    )
  }
}
