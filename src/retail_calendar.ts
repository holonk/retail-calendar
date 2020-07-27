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
} from './types'

import { CalendarMonth } from './calendar_month'
import { CalendarWeek } from './calendar_week'
import { LastDayBeforeEOMStrategy } from './last_day_before_eom'
import { LastDayNearestEOMStrategy } from './last_day_nearest_eom'
import { FirstBOWOfFirstMonth } from './first_bow_of_first_month'

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

  constructor(calendarOptions: RetailCalendarOptions, year: number) {
    this.year = year
    this.options = calendarOptions
    this.calendarYear = this.getAdjustedGregorianYear(year)
    this.numberOfWeeks = this.calculateNumberOfWeeks()
    this.lastDayOfYear = this.calculateLastDayOfYear(this.calendarYear)
    this.firstDayOfYear = moment(this.lastDayOfYear)
      .subtract(this.numberOfWeeks, 'week')
      .add(1, 'day')
      .startOf('day')
    this.weeks = this.generateWeeks()
    this.months = this.generateMonths()
  }

  generateMonths(): RetailCalendarMonth[] {
    const months = []
    let index = 1
    const currentStart = this.firstDayOfYear

    for (const numberOfWeeks of this.getWeekDistribution()) {
      const quarterOfYear = Math.ceil(index / 3)
      const weeks = this.weeks.filter((week) => week.monthOfYear === index)
      const monthStart = moment(currentStart)
      const monthEnd = moment(monthStart)
        .add(numberOfWeeks, 'week')
        .subtract(1, 'day')
        .endOf('day')
      months.push(
        new CalendarMonth(
          index,
          quarterOfYear,
          numberOfWeeks,
          weeks,
          monthStart.toDate(),
          monthEnd.toDate(),
        ),
      )
      index += 1
      currentStart.add(numberOfWeeks, 'week')
    }

    return months
  }

  generateWeeks(): RetailCalendarWeek[] {
    const weeks = []
    for (let index = 0; index < this.numberOfWeeks; index++) {
      const restatedWeekIndex = this.getRestatedWeekIndex(index)
      const [
        monthOfYear,
        weekOfMonth,
        weekOfQuarter,
        quarterOfYear,
      ] = this.getMonthAndWeekOfMonthOfRestatedWeek(restatedWeekIndex)
      const start = moment(this.firstDayOfYear).add(index, 'week')
      const end = moment(start).add(1, 'week').subtract(1, 'day').endOf('day')
      weeks.push(
        new CalendarWeek(
          restatedWeekIndex,
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

  getMonthAndWeekOfMonthOfRestatedWeek(
    weekIndex: number,
  ): [number, number, number, number] {
    if (weekIndex === -1) {
      return [-1, -1, -1, -1]
    }
    const weekDistribution = this.getWeekDistribution()
    let monthOfYear = 1
    let quarterOfYear = 1
    let remainder = weekIndex
    const weekOfQuarter = weekIndex % 13
    for (const weeksInMonth of weekDistribution) {
      if (remainder < weeksInMonth) {
        break
      }
      remainder -= weeksInMonth
      monthOfYear += 1
      quarterOfYear = Math.ceil(monthOfYear / 3)
    }
    return [monthOfYear, remainder, weekOfQuarter, quarterOfYear]
  }

  getWeekDistribution(): number[] {
    switch (this.options.weekGrouping) {
      case WeekGrouping.Group445:
        return [4, 4, 5, 4, 4, 5, 4, 4, 5, 4, 4, 5]
      case WeekGrouping.Group454:
        return [4, 5, 4, 4, 5, 4, 4, 5, 4, 4, 5, 4]
      case WeekGrouping.Group544:
        return [5, 4, 4, 5, 4, 4, 5, 4, 4, 5, 4, 4]
    }
  }

  getRestatedWeekIndex(weekIndex: number): number {
    if (this.numberOfWeeks !== 53) {
      return weekIndex
    }

    if (this.options.restated) {
      // If restated shift all weeks by -1
      return weekIndex - 1
    } else if (weekIndex === 52) {
      // If not restated, move
      return -1
    } else {
      return weekIndex
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
