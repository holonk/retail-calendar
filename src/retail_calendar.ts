import moment from 'moment'
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
  LeapYearStrategy,
} from './types'

import { CalendarMonth } from './calendar_month'
import { CalendarWeek } from './calendar_week'
import { LastDayBeforeEOMStrategy } from './last_day_before_eom'
import { LastDayNearestEOMStrategy } from './last_day_nearest_eom'
import { FirstBOWOfFirstMonth } from './first_bow_of_first_month'
import { LastDayBeforeEOMExceptLeapYearStrategy } from './last_day_before_eom_except_leap_year'

export const RetailCalendarFactory: RetailCalendarConstructor = class Calendar
  implements RetailCalendar {
  year: number
  calendarYear: number
  numberOfWeeks: number
  months: RetailCalendarMonth[]
  weeks: RetailCalendarWeek[]
  options: RetailCalendarOptions
  lastDayOfYear: moment.Moment
  firstDayOfYear: moment.Moment
  leapYearStrategy: LeapYearStrategy

  constructor(calendarOptions: RetailCalendarOptions, year: number) {
    this.year = year
    this.options = calendarOptions
    this.calendarYear = this.getAdjustedGregorianYear(year)
    this.leapYearStrategy = this.getLeapYearStrategy()
    this.numberOfWeeks = this.calculateNumberOfWeeks()
    this.lastDayOfYear = this.calculateLastDayOfYear(this.calendarYear)
    this.firstDayOfYear = moment(this.lastDayOfYear)
      .subtract(this.numberOfWeeks, 'week')
      .add(1, 'day')
      .startOf('day')
    this.weeks = this.generateWeeks()
    this.months = this.generateMonths()
  }

  getLeapYearStrategy() {
    if (
      this.options.restated === undefined &&
      this.options.leapYearStrategy === undefined
    ) {
      throw new Error(
        'One of leapYearStrategy or restated options are required',
      )
    }

    if (this.options.restated !== undefined) {
      // tslint:disable-next-line:no-console
      console.warn(
        'restated option is deprecated. Please use leapYearStrategy instead',
      )
    }

    if (
      this.options.restated !== undefined &&
      this.options.leapYearStrategy !== undefined
    ) {
      throw new Error(
        'Only one of leapYearStrategy or restated options can be given',
      )
    }

    if (this.options.restated !== undefined && this.options.restated === true) {
      return LeapYearStrategy.Restated
    }

    if (this.options.leapYearStrategy !== undefined) {
      return this.options.leapYearStrategy
    }

    return LeapYearStrategy.DropLastWeek
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
      const monthStart = moment(weeksOfMonth[0].gregorianStartDate)
      const monthEnd = moment(
        weeksOfMonth[weeksOfMonth.length - 1].gregorianEndDate,
      )
      months.push(
        new CalendarMonth(
          index,
          quarterOfYear,
          numberOfWeeks,
          weeksOfMonth,
          monthStart.toDate(),
          monthEnd.toDate(),
        ),
      )
      index += 1
    }

    return months
  }

  generateWeeks(): RetailCalendarWeek[] {
    const weeks = []
    for (let index = 0; index < this.numberOfWeeks; index++) {
      const weekIndex = this.getWeekIndex(index)
      const [
        monthOfYear,
        weekOfMonth,
        weekOfQuarter,
        quarterOfYear,
      ] = this.getMonthAndWeekOfMonthOfWeek(weekIndex)
      const start = moment(this.firstDayOfYear).add(index, 'week')
      const end = moment(start).add(1, 'week').subtract(1, 'day').endOf('day')
      weeks.push(
        new CalendarWeek(
          weekIndex,
          weekOfMonth,
          weekOfQuarter,
          monthOfYear,
          quarterOfYear,
          start.toDate(),
          end.toDate(),
        ),
      )
    }
    return weeks
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
      this.leapYearStrategy === LeapYearStrategy.AddToPenultimateMonth &&
      this.numberOfWeeks === 53
    )
      weekDistribution[10]++

    return weekDistribution
  }

  getWeekIndex(weekIndex: number): number {
    if (this.numberOfWeeks !== 53) {
      return weekIndex
    }

    switch (this.leapYearStrategy) {
      case LeapYearStrategy.Restated:
        return weekIndex - 1
      case LeapYearStrategy.AddToPenultimateMonth:
        return weekIndex
      default:
        return weekIndex === 52 ? -1 : weekIndex
    }
  }

  calculateLastDayOfYear(year: number): moment.Moment {
    const lastDayOfYear = moment()
      .year(year)
      .month(this.options.lastMonthOfYear)
      .endOf('month')
    const lastIsoWeekDay = this.options.lastDayOfWeek
    const weekCalculation = this.getWeekCalculationStrategy(
      this.options.weekCalculation,
    )
    return weekCalculation.getLastDayForGregorianLastDay(
      lastDayOfYear,
      lastIsoWeekDay,
    )
  }

  calculateNumberOfWeeks(): any {
    // Make sure we get whole day difference
    // by measuring from the end of current year to start of last year
    const lastDayOfYear = this.calculateLastDayOfYear(this.calendarYear).endOf(
      'day',
    )
    const lastDayOfLastYear = this.calculateLastDayOfYear(
      this.calendarYear - 1,
    ).startOf('day')
    const numWeeks = lastDayOfYear.diff(lastDayOfLastYear, 'week')
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
