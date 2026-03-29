import { Redis } from '@upstash/redis'

export const redis = new Redis({
  url: process.env.KV_REST_API_URL!,
  token: process.env.KV_REST_API_TOKEN!,
})

// Helper to get today's date key in YYYY-MM-DD format
export function getTodayKey(): string {
  const now = new Date()
  return now.toISOString().split('T')[0]
}

// Helper to get yesterday's date key
export function getYesterdayKey(): string {
  const now = new Date()
  now.setDate(now.getDate() - 1)
  return now.toISOString().split('T')[0]
}

// Data structure keys
export const KEYS = {
  // Set of user IDs who checked in on a date
  dailyUsers: (date: string) => `mulk:daily:${date}:users`,
  // Hash of country code -> count for a date
  dailyCountries: (date: string) => `mulk:daily:${date}:countries`,
  // User's streak count
  userStreak: (userId: string) => `mulk:user:${userId}:streak`,
  // User's last check-in date
  userLastCheckin: (userId: string) => `mulk:user:${userId}:last_checkin`,
}
