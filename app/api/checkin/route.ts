import { NextResponse } from 'next/server'
import { redis, getTodayKey, getYesterdayKey, KEYS } from '@/lib/redis'

export async function POST(request: Request) {
  try {
    const { userId, countryCode } = await request.json()
    
    console.log('[v0] Check-in request:', { userId, countryCode })
    
    if (!userId || !countryCode) {
      console.log('[v0] Missing userId or countryCode')
      return NextResponse.json(
        { error: 'Missing userId or countryCode' },
        { status: 400 }
      )
    }
    
    const today = getTodayKey()
    console.log('[v0] Today key:', today)
    const yesterday = getYesterdayKey()
    
    // Check if user already checked in today
    const alreadyCheckedIn = await redis.sismember(KEYS.dailyUsers(today), userId)
    
    if (alreadyCheckedIn) {
      return NextResponse.json(
        { error: 'Already checked in today', alreadyCheckedIn: true },
        { status: 400 }
      )
    }
    
    // Add user to today's check-ins
    const addResult = await redis.sadd(KEYS.dailyUsers(today), userId)
    console.log('[v0] Add user result:', addResult)
    
    // Increment country count for today
    const countryResult = await redis.hincrby(KEYS.dailyCountries(today), countryCode, 1)
    console.log('[v0] Country increment result:', countryResult)
    
    // Calculate streak
    const lastCheckin = await redis.get<string>(KEYS.userLastCheckin(userId))
    let streak = 1
    
    if (lastCheckin === yesterday) {
      // User checked in yesterday, increment streak
      const currentStreak = await redis.get<number>(KEYS.userStreak(userId))
      streak = (currentStreak || 0) + 1
    }
    // If lastCheckin is not yesterday, streak resets to 1
    
    // Update user's streak and last check-in date
    await redis.set(KEYS.userStreak(userId), streak)
    await redis.set(KEYS.userLastCheckin(userId), today)
    
    console.log('[v0] Check-in successful:', { streak, date: today })
    
    return NextResponse.json({
      success: true,
      streak,
      date: today,
    })
  } catch (error) {
    console.error('Check-in error:', error)
    return NextResponse.json(
      { error: 'Failed to check in' },
      { status: 500 }
    )
  }
}
