import {
  RetailCalendar,
  RetailCalendarConstructor,
  RetailCalendarMonth,
  RetailCalendarOptions,
  RetailCalendarWeek,
  WeekCalculation,
  WeekGrouping,
  LastDayStrategy,
  LastMonthOfYear,
  RetailCalendarDay,
} from './types'

import { CalendarMonth } from './calendar_month'
import { CalendarWeek } from './calendar_week'
import { LastDayBeforeEOMStrategy } from './last_day_before_eom'
import { LastDayNearestEOMStrategy } from './last_day_nearest_eom'
import { FirstBOWOfFirstMonth } from './first_bow_of_first_month'
import { LastDayBeforeEOMExceptLeapYearStrategy } from './last_day_before_eom_except_leap_year'
import {
  addDaysToDate,
  addWeeksToDate,
  endOfDay,
  endOfMonth,
  getDayOfYear,
  getWeekDifference,
  newSafeDate,
  startOfDay,
} from './date_utils'
import {
  createMemoizationKeyFromCalendarOptionsAndYear,
  memoize,
} from './utils/memoization'
import { PenultimateDayOfWeekNearestEOMStrategy } from './penultimate_day_of_week_nearest_eom'
import { CustomLeapYearStrategy } from './custom_leap_year'

const buildRetailCalendarFactory = memoize(
  (retailCalendarOptions: RetailCalendarOptions, year: number) =>
    new RetailCalendarFactory(retailCalendarOptions, year),
  (retailCalendarOptions: RetailCalendarOptions, year: number) =>
    createMemoizationKeyFromCalendarOptionsAndYear(retailCalendarOptions, year),
)

export const RetailCalendarFactory: RetailCalendarConstructor = class Calendar
  implements RetailCalendar {
  year: number
  calendarYear: number
  numberOfWeeks: number
  months: RetailCalendarMonth[]
  weeks: RetailCalendarWeek[]
  days: RetailCalendarDay[]
  options: RetailCalendarOptions
  lastDayOfYear: Date
  firstDayOfYear: Date
  addLeapWeekToMonth: number

  constructor(calendarOptions: RetailCalendarOptions, year: number) {
    this.year = year
    this.options = calendarOptions
    this.calendarYear = this.getAdjustedGregorianYear(year)
    this.addLeapWeekToMonth = this.options.addLeapWeekToMonth ?? -1
    this.numberOfWeeks = this.calculateNumberOfWeeks()
    this.lastDayOfYear = this.calculateLastDayOfYear(
      this.calendarYear,
      this.year,
    )
    this.firstDayOfYear = startOfDay(
      addDaysToDate(addWeeksToDate(this.lastDayOfYear, -this.numberOfWeeks), 1),
    )
    this.weeks = this.generateWeeks()
    this.months = this.generateMonths()
    this.days = this.generateDays()
  }

  static getRetailCalendar(
    retailCalendarOptions: RetailCalendarOptions,
    year: number,
  ) {
    return buildRetailCalendarFactory(retailCalendarOptions, year)
  }

  generateMonths(): RetailCalendarMonth[] {
    const months = []
    const beginningIndex = this.getBeginningOfMonthIndex()
    let index = beginningIndex

    for (const numberOfWeeks of this.getWeekDistribution()) {
      const quarterOfYear = Math.floor((index - beginningIndex) / 3) + 1
      const weeksOfMonth = this.weeks.filter(
        (week) => week.monthOfYear === index,
      )
      const monthStart = new Date(weeksOfMonth[0].gregorianStartDate)
      const monthEnd = new Date(
        weeksOfMonth[weeksOfMonth.length - 1].gregorianEndDate,
      )
      months.push(
        new CalendarMonth(
          index,
          quarterOfYear,
          numberOfWeeks,
          weeksOfMonth,
          monthStart,
          monthEnd,
        ),
      )
      index += 1
    }

    return months
  }

  generateWeeks(): RetailCalendarWeek[] {
    const weeks = []
    for (let index = 0; index < this.numberOfWeeks; index++) {
      const weekIndex = index
      const [
        monthOfYear,
        weekOfMonth,
        weekOfQuarter,
        quarterOfYear,
      ] = this.getMonthAndWeekOfMonthOfWeek(weekIndex)
      const start = addWeeksToDate(this.firstDayOfYear, index)
      const end = endOfDay(addDaysToDate(addWeeksToDate(start, 1), -1))
      weeks.push(
        new CalendarWeek(
          weekIndex,
          weekOfMonth,
          weekOfQuarter,
          monthOfYear,
          quarterOfYear,
          start,
          end,
        ),
      )
    }
    return weeks
  }

  generateDays(): RetailCalendarDay[] {
    const days: RetailCalendarDay[] = []
    const DAYS_IN_WEEK = 7
    let dayOfYear = 1
    this.weeks.forEach((week) => {
      for (let dayIndex = 1; dayIndex < DAYS_IN_WEEK + 1; dayIndex++) {
        const gregorianStartDate = addDaysToDate(
          week.gregorianStartDate,
          dayIndex - 1,
        )
        const gregorianEndDate = endOfDay(gregorianStartDate)
        const gregorianMonthOfYear = gregorianStartDate.getMonth() + 1 // JS Date is 0 indexed
        const gregorianDayOfYear = getDayOfYear(gregorianStartDate)
        const gregorianDayOfMonth = gregorianStartDate.getDate()

        const isLeapWeek = this.isLeapWeek(week.weekOfYear)
        days.push({
          dayOfYear,
          dayOfWeek: dayIndex,
          dayOfMonth: isLeapWeek ? -1 : week.weekOfMonth * 7 + dayIndex,
          weekOfYear: week.weekOfYear,
          monthOfYear: isLeapWeek ? -1 : week.monthOfYear,
          gregorianStartDate,
          gregorianEndDate,
          gregorianMonthOfYear,
          gregorianDayOfYear,
          gregorianDayOfMonth,
        })
        dayOfYear += 1
      }
    })
    return days
  }

  isLeapWeek(weekIndex: number): boolean {
    if (weekIndex !== 52) {
      return false
    }

    // If addLeapWeekToMonth is greater than zero, then that month has one additional week.
    // As a result, the 52nd week is not a leap week.
    return this.addLeapWeekToMonth === -1
  }

  getMonthAndWeekOfMonthOfWeek(
    weekIndex: number,
  ): [number, number, number, number] {
    const weekDistribution = this.getWeekDistribution()
    const monthOffset = this.getBeginningOfMonthIndex()

    let weekCount = 0
    let monthOfYear = 0
    let weekInQuarter = 0
    let quarterOfYear = 0

    for (let monthIndex = 0; monthIndex < 12; monthIndex++) {
      const weeksInMonth = weekDistribution[monthIndex]
      monthOfYear = monthIndex + monthOffset

      if (monthIndex % 3 === 0) {
        weekInQuarter = 0
        quarterOfYear = Math.floor(monthIndex / 3) + 1
      }

      for (let weekInMonth = 0; weekInMonth < weeksInMonth; weekInMonth++) {
        if (weekIndex === weekCount) {
          return [monthOfYear, weekInMonth, weekInQuarter, quarterOfYear]
        }

        weekCount++
        weekInQuarter++
      }
    }

    return [-1, -1, -1, -1]
  }

  getBeginningOfMonthIndex(): number {
    const optionsIndex = this.options.beginningMonthIndex
    if (optionsIndex !== undefined && optionsIndex !== null) {
      return optionsIndex
    } else {
      return 1
    }
  }

  getWeekDistribution(): number[] {
    let weekDistribution: number[]

    switch (this.options.weekGrouping) {
      case WeekGrouping.Group445:
        weekDistribution = [4, 4, 5, 4, 4, 5, 4, 4, 5, 4, 4, 5]
        break
      case WeekGrouping.Group454:
        weekDistribution = [4, 5, 4, 4, 5, 4, 4, 5, 4, 4, 5, 4]
        break
      case WeekGrouping.Group544:
        weekDistribution = [5, 4, 4, 5, 4, 4, 5, 4, 4, 5, 4, 4]
        break
    }

    if (
      this.options.addLeapWeekToMonth &&
      this.options.addLeapWeekToMonth >= 0 &&
      this.numberOfWeeks === 53
    )
      weekDistribution[this.options.addLeapWeekToMonth]++

    return weekDistribution
  }

  calculateLastDayOfYear(year: number, retailCalendarYear: number): Date {
    const firstDayOfLastMonthOfYear = newSafeDate()
    firstDayOfLastMonthOfYear.setFullYear(year)
    firstDayOfLastMonthOfYear.setMonth(this.options.lastMonthOfYear, 1)

    const lastDayOfYear = endOfMonth(firstDayOfLastMonthOfYear)
    const lastIsoWeekDay = this.options.lastDayOfWeek
    const weekCalculation = this.getWeekCalculationStrategy(
      this.options.weekCalculation,
    )
    return weekCalculation.getLastDayForGregorianLastDay(
      lastDayOfYear,
      lastIsoWeekDay,
      retailCalendarYear,
    )
  }

  calculateNumberOfWeeks(): any {
    // Make sure we get whole day difference
    // by measuring from the end of current year to start of last year
    const lastDayOfYear = endOfDay(
      this.calculateLastDayOfYear(this.calendarYear, this.year),
    )
    const lastDayOfLastYear = startOfDay(
      this.calculateLastDayOfYear(this.calendarYear - 1, this.year - 1),
    )
    const numWeeks = getWeekDifference(lastDayOfYear, lastDayOfLastYear)
    return numWeeks
  }

  getWeekCalculationStrategy(
    weekCalculation: WeekCalculation,
  ): LastDayStrategy {
    switch (weekCalculation) {
      case WeekCalculation.LastDayBeforeEOM:
        return new LastDayBeforeEOMStrategy()
      case WeekCalculation.LastDayBeforeEomExceptLeapYear:
        return new LastDayBeforeEOMExceptLeapYearStrategy()
      case WeekCalculation.LastDayNearestEOM:
        return new LastDayNearestEOMStrategy()
      case WeekCalculation.FirstBOWOfFirstMonth:
        return new FirstBOWOfFirstMonth()
      case WeekCalculation.PenultimateDayOfWeekNearestEOM:
        return new PenultimateDayOfWeekNearestEOMStrategy()
      case WeekCalculation.CustomLeapYear: {
        const { leapYear, leapYearEndDate, leapYearFrequency } = this.options
        if (
          leapYear === undefined ||
          leapYearEndDate === undefined ||
          leapYearFrequency === undefined
        ) {
          throw new Error(
            'CustomLeapYear week calculation requires leapYear, leapYearEndDate, and leapYearFrequency to be defined',
          )
        }
        return new CustomLeapYearStrategy(
          leapYear,
          leapYearEndDate,
          leapYearFrequency,
        )
      }
    }
  }

  getAdjustedGregorianYear(year: number): number {
    if (this.options.lastMonthOfYear !== LastMonthOfYear.December) {
      return year + 1
    } else {
      return year
    }
  }
}
