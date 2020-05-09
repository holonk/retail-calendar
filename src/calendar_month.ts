import { RetailCalendarMonth, RetailCalendarWeek } from './types'

export class CalendarMonth implements RetailCalendarMonth {
  monthOfYear: number
  numberOfWeeks: number
  weeks: RetailCalendarWeek[]
  gregorianStartDate: Date
  gregorianEndDate: Date
  constructor(
    monthOfYear: number,
    numberOfWeeks: number,
    weeks: RetailCalendarWeek[],
    gregorianStartDate: Date,
    gregorianEndDate: Date,
  ) {
    this.monthOfYear = monthOfYear
    this.numberOfWeeks = numberOfWeeks
    this.weeks = weeks
    this.gregorianStartDate = gregorianStartDate
    this.gregorianEndDate = gregorianEndDate
  }
}
