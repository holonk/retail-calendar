import { RetailCalendarFactory } from "./retail_calendar"
import { RetailCalendarOptions, WeekOfCalendar } from "./types"

 export function weekOfGregorianDate(date: Date, calendarOptions: RetailCalendarOptions): WeekOfCalendar {
   const year = date.getFullYear()
   const candidateYears = [year -1, year, year + 1]
   for (let candiateYear of candidateYears) {
     const calendar = new RetailCalendarFactory(calendarOptions, candiateYear)
     const week = calendar.weeks.find(week => week.gregorianStartDate <=  date && week.gregorianEndDate >= date)
     if (week) {
       return {
         calendar: calendar,
         week: week
       }
     }
   }
   throw new Error(`No retail calendar week found for ${date.toDateString()}. This should never be the case. Please report this to calendar authorities.`)
 }