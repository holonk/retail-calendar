import { RetailCalendarWeek } from './types'

export class CalendarWeek implements RetailCalendarWeek {
  weekOfYear: number
  weekOfMonth: number
  weekOfQuarter: number
  monthOfYear: number
  quarterOfYear: number
  gregorianStartDate: Date
  gregorianEndDate: Date
  constructor(
    weekOfYear: number,
    weekOfMonth: number,
    weekOfQuarter: number,
    monthOfYear: number,
    quarterOfYear: number,
    gregorianStartDate: Date,
    gregorianEndDate: Date,
  ) {
    this.weekOfYear = weekOfYear
    this.weekOfQuarter = weekOfQuarter
    this.weekOfMonth = weekOfMonth
    this.monthOfYear = monthOfYear
    this.quarterOfYear = quarterOfYear
    this.gregorianStartDate = gregorianStartDate
    this.gregorianEndDate = gregorianEndDate
  }
}
