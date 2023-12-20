import {
  addDaysToDate,
  addWeeksToDate,
  getDayDifference,
  setIsoWeekDay,
} from './date_utils'
import { LastDayStrategy } from './types'
import { LastDayNearestEOMStrategy } from './last_day_nearest_eom'

export class PenultimateDayOfWeekNearestEOMStrategy implements LastDayStrategy {
  getLastDayForGregorianLastDay(
    lastDayOfGregorianYear: Date,
    lastDayOfIsoWeek: number,
    retailCalendarYear: number,
  ): Date {
    // get penultimate day of ISO week by moving one day back
    const penultimateDayOfIsoWeek =
      lastDayOfIsoWeek === 0 ? 6 : lastDayOfIsoWeek - 1
    // use last day nearest end of month logic
    const lastDayNearestEOMStrategy = new LastDayNearestEOMStrategy()
    const lastWeekOfYear = lastDayNearestEOMStrategy.getLastDayForGregorianLastDay(
      lastDayOfGregorianYear,
      penultimateDayOfIsoWeek,
      retailCalendarYear,
    )

    // move the day one day forward to get the last day of the week
    return addDaysToDate(lastWeekOfYear, 1)
  }
}
