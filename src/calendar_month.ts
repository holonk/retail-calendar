import { MerchandiseCalendarMonth, MerchandiseCalendarWeek } from './types'

export class CalendarMonth implements MerchandiseCalendarMonth {
  monthOfYear: number
  numberOfWeeks: number
  weeks: MerchandiseCalendarWeek[]
  gregorianStartDate: Date
  gregorianEndDate: Date
  constructor(
    monthOfYear: number,
    numberOfWeeks: number,
    weeks: MerchandiseCalendarWeek[],
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
