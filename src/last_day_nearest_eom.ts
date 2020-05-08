import moment from 'moment'
import { LastDayStrategy } from './types'

export class LastDayNearestEOMStrategy implements LastDayStrategy {
  getLastDayForGregorianLastDay(
    lastDayOfGregorianYear: moment.Moment,
    lastDayOfIsoWeek: number,
  ): moment.Moment {
    const mutableLastDay = moment(lastDayOfGregorianYear)
    // Generate 3 candidates which has the same day of week.
    // Current week, last week, next week
    const currentWeekCandidate = moment(mutableLastDay).isoWeekday(
      lastDayOfIsoWeek,
    )

    const lastWeekCandidate = moment(mutableLastDay)
      .subtract(1, 'week')
      .isoWeekday(lastDayOfIsoWeek)
    const nextWeekCandidate = moment(mutableLastDay)
      .add(1, 'week')
      .isoWeekday(lastDayOfIsoWeek)

    // Calculate absolute day differences from each candidate to EOM
    const currentWeekDiff = Math.abs(
      mutableLastDay.diff(currentWeekCandidate, 'days'),
    )
    const lastWeekDiff = Math.abs(
      mutableLastDay.diff(lastWeekCandidate, 'days'),
    )
    const nextWeekDiff = Math.abs(
      mutableLastDay.diff(nextWeekCandidate, 'days'),
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
