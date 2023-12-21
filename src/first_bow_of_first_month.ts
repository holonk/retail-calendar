import { addDaysToDate, getIsoWeekDay } from './date_utils'
import { LastDayStrategy } from './types'

export class FirstBOWOfFirstMonth implements LastDayStrategy {
  getLastDayForGregorianLastDay(
    lastDayOfGregorianYear: Date,
    lastDayOfIsoWeek: number,
    _retailCalendarYear: number,
  ): Date {
    const firstDayOfIsoWeek = lastDayOfIsoWeek === 7 ? 1 : lastDayOfIsoWeek + 1
    // Go to the next month, i.e start month of next year
    let mutableLastDay = addDaysToDate(lastDayOfGregorianYear, 1)
    // Find the first day which is a start of the week
    while (getIsoWeekDay(mutableLastDay) !== firstDayOfIsoWeek) {
      mutableLastDay = addDaysToDate(mutableLastDay, 1)
    }
    // That was the start of next year
    // Go back by one day and find end of this year.
    mutableLastDay = addDaysToDate(mutableLastDay, -1)
    return mutableLastDay
  }
}
