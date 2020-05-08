import { MerchandiseCalendarWeek } from './types'

export class CalendarWeek implements MerchandiseCalendarWeek {
  weekOfYear: number
  weekOfMonth: number
  monthOfYear: number
  gregorianStartDate: Date
  gregorianEndDate: Date
  constructor(
    weekOfYear: number,
    weekOfMonth: number,
    monthOfYear: number,
    gregorianStartDate: Date,
    gregorianEndDate: Date,
  ) {
    this.weekOfYear = weekOfYear
    this.weekOfMonth = weekOfMonth
    this.monthOfYear = monthOfYear
    this.gregorianStartDate = gregorianStartDate
    this.gregorianEndDate = gregorianEndDate
  }
}
