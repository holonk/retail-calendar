export enum WeekGrouping {
  Group445,
  Group544,
  Group454,
}
export enum LastDayOfWeek {
  Monday = 1,
  Tuesday = 2,
  Wednesday = 3,
  Thursday = 4,
  Friday = 5,
  Saturday = 6,
  Sunday = 7,
}
export enum LastMonthOfYear {
  January = 0,
  February,
  March,
  April,
  May,
  June,
  July,
  August,
  September,
  October,
  November,
  December,
}
export enum WeekCalculation {
  LastDayBeforeEOM,
  LastDayBeforeEomExceptLeapYear,
  LastDayNearestEOM,
  FirstBOWOfFirstMonth,
  PenultimateDayOfWeekNearestEOM,
  CustomLeapYear,
}

// Adding new fields to this type will break memoization
// Make sure that you adjust the memoization logic in src/utils/memoization.ts#stringifyCalendarOptions
export interface RetailCalendarOptions {
  weekGrouping: WeekGrouping
  lastDayOfWeek: LastDayOfWeek
  lastMonthOfYear: LastMonthOfYear | number
  weekCalculation: WeekCalculation
  /**
   * If the value of addLeapWeekToMonth is 11, then the 11th month of the years that have 53 weeks will be extended by an additional week
   */
  addLeapWeekToMonth?: number
  beginningMonthIndex?: number
  customLeapYearOptions?: CustomLeapYearOptions
}

export type CustomLeapYearOptions = {
    calendarYear: number
    yearEndDate: string // In the format of "YYYY-MM-DD"
    leapYearFrequency: number // In years
}

export const NRFCalendarOptions: RetailCalendarOptions = {
  weekGrouping: WeekGrouping.Group454,
  lastDayOfWeek: LastDayOfWeek.Saturday,
  lastMonthOfYear: LastMonthOfYear.January,
  weekCalculation: WeekCalculation.LastDayNearestEOM,
}

export type RetailCalendarConstructor = {
  new (calendarOptions: RetailCalendarOptions, year: number): RetailCalendar
  getRetailCalendar: (
    calendarOptions: RetailCalendarOptions,
    year: number,
  ) => RetailCalendar
}

export interface RetailCalendar {
  year: number
  numberOfWeeks: number
  months: RetailCalendarMonth[]
  weeks: RetailCalendarWeek[]
  days: RetailCalendarDay[]
  addLeapWeekToMonth: number
}

export interface RetailCalendarDay {
  weekOfYear: number
  monthOfYear: number // Starts at beginningMonthIndex
  dayOfWeek: number // 1 = First day of week, 7 = Last day of week
  dayOfMonth: number // Starts at 1
  dayOfYear: number // Starts at 1
  gregorianStartDate: Date
  gregorianEndDate: Date
  gregorianMonthOfYear: number // Starts at 1
  gregorianDayOfYear: number // Starts at 1
  gregorianDayOfMonth: number // Starts at 1
}

export interface RetailCalendarWeek {
  weekOfYear: number
  weekOfMonth: number
  weekOfQuarter: number
  monthOfYear: number
  quarterOfYear: number
  gregorianStartDate: Date
  gregorianEndDate: Date
}

export interface RetailCalendarMonth {
  monthOfYear: number
  quarterOfYear: number
  numberOfWeeks: number
  weeks: RetailCalendarWeek[]
  gregorianStartDate: Date
  gregorianEndDate: Date
}

export interface LastDayStrategy {
  getLastDayForGregorianLastDay(
    lastDayOfGregorianYear: Date,
    isoLastDayOfWeek: number,
    retailCalendarYear: number,
  ): Date
}

export type WeekOfCalendar = {
  calendar: RetailCalendar
  week: RetailCalendarWeek
}

export {}

declare global {
  namespace jest {
    interface Matchers<R> {
      toBeTheSameWeekAs(expected: any): R
    }
  }
}
