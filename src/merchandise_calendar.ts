import { Moment } from 'moment'
import {
  MerchandiseCalendar,
  MerchandiseCalendarConstructor,
  MerchandiseCalendarMonth,
  MerchandiseCalendarOptions,
  MerchandiseCalendarWeek,
  WeekCalculation,
  WeekGrouping,
} from './types'
const moment = require('moment')

export const MerchandiseCalendarFactory: MerchandiseCalendarConstructor = class Calendar
  implements MerchandiseCalendar {
  year: number
  numberOfWeeks: number
  months: MerchandiseCalendarMonth[]
  weeks: MerchandiseCalendarWeek[]
  options: MerchandiseCalendarOptions
  lastDayOfYear: Moment
  firstDayOfYear: Moment

  constructor(calendarOptions: MerchandiseCalendarOptions, year: number) {
    this.year = year
    this.options = calendarOptions
    this.numberOfWeeks = this.calculateNumberOfWeeks()
    this.lastDayOfYear = this.calculateLastDayOfYear(this.year + 1)
    this.firstDayOfYear = moment(this.lastDayOfYear)
      .subtract(this.numberOfWeeks, 'week')
      .add(1, 'day')
      .startOf('day')
    this.weeks = this.generateWeeks()
    this.months = this.generateMonths()
  }

  generateMonths(): MerchandiseCalendarMonth[] {
    const months = []
    let index = 1
    const currentStart = this.firstDayOfYear

    for (const numberOfWeeks of this.getWeekDistribution()) {
      const weeks = this.weeks.filter((week) => week.monthOfYear == index)
      const monthStart = moment(currentStart)
      const monthEnd = moment(monthStart)
        .add(numberOfWeeks, 'week')
        .subtract(1, 'day')
        .endOf('day')
      months.push(
        new CalendarMonth(
          index,
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

  generateWeeks(): MerchandiseCalendarWeek[] {
    const weeks = []
    for (let index = 0; index < this.numberOfWeeks; index++) {
      const restatedWeekIndex = this.getRestatedWeekIndex(index)
      const [
        monthOfYear,
        weekOfMonth,
      ] = this.getMonthAndWeekOfMonthOfRestatedWeek(restatedWeekIndex)
      const start = moment(this.firstDayOfYear).add(index, 'week')
      const end = moment(start).add(1, 'week').subtract(1, 'day').endOf('day')
      weeks.push(
        new CalendarWeek(
          index,
          weekOfMonth,
          monthOfYear,
          start.toDate(),
          end.toDate(),
        ),
      )
    }
    return weeks
  }

  getMonthAndWeekOfMonthOfRestatedWeek(weekIndex: number): [number, number] {
    if (weekIndex == -1) {
      return [-1, -1]
    }
    const weekDistribution = this.getWeekDistribution()
    let monthOfYear = 1
    let remainder = weekIndex
    for (const weeksInMonth of weekDistribution) {
      if (remainder < weeksInMonth) {
        break
      }
      remainder -= weeksInMonth
      monthOfYear += 1
    }
    return [monthOfYear, remainder]
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
    if (this.numberOfWeeks != 53) {
      return weekIndex
    }

    if (this.options.restated) {
      // If restated shift all weeks by -1
      return weekIndex - 1
    } else if (weekIndex == 52) {
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
    const lastDayOfYear = this.calculateLastDayOfYear(this.year + 1)
    const lastDayOfLastYear = this.calculateLastDayOfYear(this.year)
    return lastDayOfYear.diff(lastDayOfLastYear, 'week')
  }

  getWeekCalculationStrategy(
    weekCalculation: WeekCalculation,
  ): LastDayStrategy {
    switch (weekCalculation) {
      case WeekCalculation.LastDayBeforeEOM:
        return new LastDayBeforeEOMStrategy()
      case WeekCalculation.LastDayNearestEOM:
        return new LastDayNearestEOMStrategy()
    }
  }
}

class CalendarWeek implements MerchandiseCalendarWeek {
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

class CalendarMonth implements MerchandiseCalendarMonth {
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

interface LastDayStrategy {
  getLastDayForGregorianLastDay(
    lastDayOfGregorianYear: Moment,
    isoLastDayOfWeek: number,
  ): Moment
}

class LastDayBeforeEOMStrategy implements LastDayStrategy {
  getLastDayForGregorianLastDay(
    lastDayOfGregorianYear: Moment,
    lastDayOfIsoWeek: number,
  ): Moment {
    const candidate = moment(lastDayOfGregorianYear).isoWeekday(
      lastDayOfIsoWeek,
    )

    if (candidate.month() != lastDayOfGregorianYear.month()) {
      candidate.subtract(1, 'week')
    }
    return candidate
  }
}

class LastDayNearestEOMStrategy implements LastDayStrategy {
  getLastDayForGregorianLastDay(
    lastDayOfGregorianYear: Moment,
    lastDayOfIsoWeek: number,
  ): Moment {
    const mutableLastDay = moment(lastDayOfGregorianYear)
    // Generate 3 candidates which has the same day of week.
    // Current week, last week, next week
    const currentWeekCandidate = moment(mutableLastDay).isoWeekday(
      lastDayOfIsoWeek,
    )

    const lastWeekCandidate = moment(mutableLastDay)
      .subtract(1, 'week')
      .isoWeekday(lastDayOfIsoWeek)
    const nextWeekCandidate = moment(mutableLastDay)
      .add(1, 'week')
      .isoWeekday(lastDayOfIsoWeek)

    // Calculate absolute day differences from each candidate to EOM
    const currentWeekDiff = Math.abs(
      mutableLastDay.diff(currentWeekCandidate, 'days'),
    )
    const lastWeekDiff = Math.abs(
      mutableLastDay.diff(lastWeekCandidate, 'days'),
    )
    const nextWeekDiff = Math.abs(
      mutableLastDay.diff(nextWeekCandidate, 'days'),
    )

    // Find nearest difference
    const minDiff = Math.min(currentWeekDiff, lastWeekDiff, nextWeekDiff)

    if (minDiff == nextWeekDiff) {
      return nextWeekCandidate
    } else if (minDiff == lastWeekDiff) {
      return lastWeekCandidate
    } else {
      return currentWeekCandidate
    }
  }
}
