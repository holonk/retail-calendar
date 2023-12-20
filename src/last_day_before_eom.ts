import { addWeeksToDate, setIsoWeekDay } from './date_utils'
import { LastDayStrategy } from './types'

export class LastDayBeforeEOMStrategy implements LastDayStrategy {
  getLastDayForGregorianLastDay(
    lastDayOfGregorianYear: Date,
    lastDayOfIsoWeek: number,
    _retailCalendarYear: number,
  ): Date {
    let candidate = setIsoWeekDay(lastDayOfGregorianYear, lastDayOfIsoWeek)

    if (candidate.getMonth() !== lastDayOfGregorianYear.getMonth()) {
      candidate = addWeeksToDate(candidate, -1)
    }
    return candidate
  }
}
