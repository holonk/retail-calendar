import {
  addWeeksToDate,
  getDayDifference,
  setIsoWeekDay,
} from './date_utils'
import { LastDayStrategy } from './types'

export class LastDayNearestEOMStrategy implements LastDayStrategy {
  getLastDayForGregorianLastDay(
    lastDayOfGregorianYear: Date,
    lastDayOfIsoWeek: number,
  ): Date {
    const mutableLastDay = new Date(lastDayOfGregorianYear)
    // Generate 3 candidates which has the same day of week.
    // Current week, last week, next week
    const currentWeekCandidate = setIsoWeekDay(mutableLastDay, lastDayOfIsoWeek)

    const lastWeekCandidate = setIsoWeekDay(
      addWeeksToDate(mutableLastDay, -1),
      lastDayOfIsoWeek,
    )
    const nextWeekCandidate = setIsoWeekDay(
      addWeeksToDate(mutableLastDay, 1),
      lastDayOfIsoWeek,
    )

    // Calculate absolute day differences from each candidate to EOM
    const currentWeekDiff = Math.abs(
      getDayDifference(mutableLastDay, currentWeekCandidate),
    )
    const lastWeekDiff = Math.abs(
      getDayDifference(mutableLastDay, lastWeekCandidate),
    )
    const nextWeekDiff = Math.abs(
      getDayDifference(mutableLastDay, nextWeekCandidate),
    )

    // Find nearest difference
    const minDiff = Math.min(currentWeekDiff, lastWeekDiff, nextWeekDiff)

    if (minDiff === nextWeekDiff) {
      return nextWeekCandidate
    } else if (minDiff === lastWeekDiff) {
      return lastWeekCandidate
    } else {
      return currentWeekCandidate
    }
  }
}
