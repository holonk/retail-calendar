import {
  addDaysToDate,
  addWeeksToDate,
  endOfYear,
  getWeekDifference,
} from './date_utils'
import { LastDayBeforeEOMStrategy } from './last_day_before_eom'
import { LastDayStrategy } from './types'

export class LastDayBeforeEOMExceptLeapYearStrategy implements LastDayStrategy {
  getLastDayForGregorianLastDay(
    lastDayOfGregorianYear: Date,
    lastDayOfIsoWeek: number,
    retailCalendarYear: number,
  ): Date {
    const lastDayOfNextGregorianYear = endOfYear(
      addDaysToDate(lastDayOfGregorianYear, 1),
    )
    const lastDayOfThisYear = new LastDayBeforeEOMStrategy().getLastDayForGregorianLastDay(
      lastDayOfGregorianYear,
      lastDayOfIsoWeek,
      retailCalendarYear,
    )
    const lastDayOfNextYear = new LastDayBeforeEOMStrategy().getLastDayForGregorianLastDay(
      lastDayOfNextGregorianYear,
      lastDayOfIsoWeek,
        retailCalendarYear + 1,
    )

    if (getWeekDifference(lastDayOfNextYear, lastDayOfThisYear) === 53) {
      return addWeeksToDate(lastDayOfThisYear, 1)
    }

    return lastDayOfThisYear
  }
}
