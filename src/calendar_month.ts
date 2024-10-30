import { RetailCalendarMonth, RetailCalendarWeek } from './types'

export type X = { y: string }
export class CalendarMonth implements RetailCalendarMonth {
  monthOfYear: number
  quarterOfYear: number
  numberOfWeeks: number
  weeks: RetailCalendarWeek[]
  gregorianStartDate: Date
  gregorianEndDate: Date
  constructor(
    monthOfYear: number,
    quarterOfYear: number,
    numberOfWeeks: number,
    weeks: RetailCalendarWeek[],
    gregorianStartDate: Date,
    gregorianEndDate: Date,
  ) {
    this.monthOfYear = monthOfYear
    this.quarterOfYear = quarterOfYear
    this.numberOfWeeks = numberOfWeeks
    this.weeks = weeks
    this.gregorianStartDate = gregorianStartDate
    this.gregorianEndDate = gregorianEndDate
  }
}
