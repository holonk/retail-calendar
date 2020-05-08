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
  LastDayNearestEOM,
}

export interface MerchandiseCalendarOptions {
  weekGrouping: WeekGrouping
  lastDayOfWeek: LastDayOfWeek
  lastMonthOfYear: LastMonthOfYear | number
  weekCalculation: WeekCalculation
  /**
   * If true, 53rd week will belong to last month in leap year. First week won't belong to any month.
   * If false, 53rd week won't belong to any month in leap year. First week will belong to the first month.
   */
  restated: boolean
}

export const NRFCalendarOptions: MerchandiseCalendarOptions = {
  weekGrouping: WeekGrouping.Group454,
  lastDayOfWeek: LastDayOfWeek.Saturday,
  lastMonthOfYear: LastMonthOfYear.January,
  weekCalculation: WeekCalculation.LastDayNearestEOM,
  restated: true,
}

export type MerchandiseCalendarConstructor = new (
  calendarOptions: MerchandiseCalendarOptions,
  year: number,
) => MerchandiseCalendar

export interface MerchandiseCalendar {
  year: number
  numberOfWeeks: number
  months: MerchandiseCalendarMonth[]
  weeks: MerchandiseCalendarWeek[]
}

export interface MerchandiseCalendarWeek {
  weekOfYear: number
  weekOfMonth: number
  monthOfYear: number
  gregorianStartDate: Date
  gregorianEndDate: Date
}

export interface MerchandiseCalendarMonth {
  monthOfYear: number
  numberOfWeeks: number
  weeks: MerchandiseCalendarWeek[]
  gregorianStartDate: Date
  gregorianEndDate: Date
}

export interface LastDayStrategy {
  getLastDayForGregorianLastDay(
    lastDayOfGregorianYear: moment.Moment,
    isoLastDayOfWeek: number,
  ): moment.Moment
}
