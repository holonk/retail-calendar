import { RetailCalendarFactory } from './retail_calendar'
import { RetailCalendarOptions, WeekOfCalendar } from './types'

export function weekOfGregorianDate(
  date: Date,
  calendarOptions: RetailCalendarOptions,
): WeekOfCalendar {
  const year = date.getFullYear()
  const candidateYears = [year - 1, year, year + 1]
  for (const candidateYear of candidateYears) {
    const calendar = RetailCalendarFactory.getRetailCalendar(
      calendarOptions,
      candidateYear,
    )
    const week = calendar.weeks.find(
      (calendarWeek) =>
        calendarWeek.gregorianStartDate <= date &&
        calendarWeek.gregorianEndDate >= date,
    )
    if (week) {
      return {
        calendar,
        week,
      }
    }
  }
  throw new Error(
    `No retail calendar week found for ${date.toDateString()}. This should never be the case. Please report this to calendar authorities.`,
  )
}
