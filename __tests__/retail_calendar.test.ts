import { RetailCalendarFactory } from '../src/retail_calendar'
import {
  RetailCalendarOptions,
  WeekGrouping,
  LastDayOfWeek,
  LastMonthOfYear,
  WeekCalculation,
  NRFCalendarOptions,
} from '../src/types'
import { nrfYears } from './data/nrf_years'
import { lastDayBeforeEOMYears } from './data/last_day_before_eom_years'
import { nrf2018 } from './data/nrf_2018'
import moment from 'moment'

describe('RetailCalendar', () => {
  describe('given NRF calendar options', () => {
    it('numberOfWeeks calculates properly for each year', () => {
      for (const { year, numberOfWeeks } of nrfYears) {
        const calendar = new RetailCalendarFactory(NRFCalendarOptions, year)
        expect(calendar.numberOfWeeks).toBe(numberOfWeeks)
      }
    })

    it('returns months with correct number of weeks', () => {
      const calendar = new RetailCalendarFactory(NRFCalendarOptions, 2018)
      const months = calendar.months
      const expectedMonthLenthsInWeeks = [4, 5, 4, 4, 5, 4, 4, 5, 4, 4, 5, 4]
      expect(months.length).toBe(12)
      expect(months.map((month) => month.weeks.length)).toEqual(
        expectedMonthLenthsInWeeks,
      )
    })

    it('returns month with correct start and end dates', () => {
      const calendar = new RetailCalendarFactory(NRFCalendarOptions, 2018)
      for (let index = 0; index < 12; index++) {
        const month = calendar.months[index]
        const nrfMonth = nrf2018[index]
        expect(month.gregorianStartDate.getTime()).toEqual(
          moment(nrfMonth.start).startOf('day').toDate().getTime(),
        )

        expect(month.gregorianEndDate.getTime()).toEqual(
          moment(nrfMonth.end).endOf('day').toDate().getTime(),
        )
      }
    })

    it('returns weeks with corect month', () => {
      const calendar = new RetailCalendarFactory(NRFCalendarOptions, 2018)
      const weeks = calendar.weeks
      // 4, 5, 4 calendar
      const monthOfYearByWeek = [
        ...Array.from({ length: 4 }).fill(1), // First 4 weeks in 1st month
        ...Array.from({ length: 5 }).fill(2), // Then 5 weeks in 2nd month
        ...Array.from({ length: 4 }).fill(3), // Then 4 weeks in 3rd month,
        // this pattern repeats for other quarters
        ...Array.from({ length: 4 }).fill(4),
        ...Array.from({ length: 5 }).fill(5),
        ...Array.from({ length: 4 }).fill(6),
        ...Array.from({ length: 4 }).fill(7),
        ...Array.from({ length: 5 }).fill(8),
        ...Array.from({ length: 4 }).fill(9),
        ...Array.from({ length: 4 }).fill(10),
        ...Array.from({ length: 5 }).fill(11),
        ...Array.from({ length: 4 }).fill(12),
      ]
      for (let index = 0; index < weeks.length; index++) {
        expect(weeks[index].monthOfYear).toBe(monthOfYearByWeek[index])
      }
    })

    it('returns weeks with corect start and end dates', () => {
      const calendar = new RetailCalendarFactory(NRFCalendarOptions, 2018)
      const weeks = calendar.weeks
      expect(weeks[0].gregorianStartDate.getTime()).toEqual(
        moment('2018-02-04').toDate().getTime(),
      )
      expect(weeks[0].gregorianEndDate.getTime()).toEqual(
        moment('2018-02-10').endOf('day').toDate().getTime(),
      )

      expect(weeks[1].gregorianStartDate.getTime()).toEqual(
        moment('2018-02-11').toDate().getTime(),
      )
      expect(weeks[1].gregorianEndDate.getTime()).toEqual(
        moment('2018-02-17').endOf('day').toDate().getTime(),
      )
    })

    describe('on leap years', () => {
      describe('when restated', () => {
        it('does not assign any months to first week', () => {
          const calendar = new RetailCalendarFactory(NRFCalendarOptions, 2017)
          const firstWeek = calendar.weeks[0]
          expect(firstWeek.monthOfYear).toBe(-1)
          expect(firstWeek.weekOfMonth).toBe(-1)
          expect(firstWeek.weekOfYear).toBe(-1)

          const secondWeekInYear = calendar.weeks[1]
          expect(secondWeekInYear.weekOfYear).toBe(0)

          const firstMonth = calendar.months[0]
          expect(firstMonth.weeks[0]).not.toEqual(firstWeek)
          expect(firstMonth.weeks[0].weekOfYear).toEqual(0)
        })
      })

      describe('when not restated', () => {
        it('does not assign any months to last week', () => {
          const calendar = new RetailCalendarFactory(
            { ...NRFCalendarOptions, restated: false },
            2017,
          )
          const lastWeek = calendar.weeks[52]
          expect(lastWeek.monthOfYear).toBe(-1)
          expect(lastWeek.weekOfMonth).toBe(-1)
          expect(lastWeek.weekOfYear).toBe(-1)

          const firstMonth = calendar.months[0]
          expect(firstMonth.weeks[0].weekOfYear).toEqual(0)

          const lastMonth = calendar.months[11]
          expect(lastMonth.weeks[3]).not.toEqual(lastWeek)
          expect(lastMonth.weeks[3]).toEqual(calendar.weeks[51])
        })
      })
    })
  })

  describe('given saturday nearest end of month option', () => {
    it('numberOfWeeks calculates properly for each year', () => {
      const calendarOptions: RetailCalendarOptions = {
        weekGrouping: WeekGrouping.Group454,
        lastDayOfWeek: LastDayOfWeek.Saturday,
        lastMonthOfYear: LastMonthOfYear.August,
        weekCalculation: WeekCalculation.LastDayBeforeEOM,
        restated: false,
      }

      for (const { year, numberOfWeeks } of lastDayBeforeEOMYears) {
        const calendar = new RetailCalendarFactory(calendarOptions, year)
        expect(calendar.numberOfWeeks).toBe(numberOfWeeks)
      }
    })

    describe('given 544 week grouping', () => {
      it('distributes weeks in 5 4 4 per month in each quarter', () => {
        const calendarOptions: RetailCalendarOptions = {
          weekGrouping: WeekGrouping.Group544,
          lastDayOfWeek: LastDayOfWeek.Saturday,
          lastMonthOfYear: LastMonthOfYear.August,
          weekCalculation: WeekCalculation.LastDayBeforeEOM,
          restated: false,
        }
        const calendar = new RetailCalendarFactory(calendarOptions, 2015)
        const expectedMonthLenthsInWeeks = [5, 4, 4, 5, 4, 4, 5, 4, 4, 5, 4, 4]
        expect(calendar.months.length).toBe(12)
        expect(calendar.months.map((month) => month.weeks.length)).toEqual(
          expectedMonthLenthsInWeeks,
        )
      })
    })

    describe('given 445 week grouping', () => {
      it('distributes weeks in 4 4 5 per month in each quarter', () => {
        const calendarOptions: RetailCalendarOptions = {
          weekGrouping: WeekGrouping.Group445,
          lastDayOfWeek: LastDayOfWeek.Saturday,
          lastMonthOfYear: LastMonthOfYear.August,
          weekCalculation: WeekCalculation.LastDayBeforeEOM,
          restated: false,
        }
        const calendar = new RetailCalendarFactory(calendarOptions, 2015)
        const expectedMonthLenthsInWeeks = [4, 4, 5, 4, 4, 5, 4, 4, 5, 4, 4, 5]
        expect(calendar.months.length).toBe(12)
        expect(calendar.months.map((month) => month.weeks.length)).toEqual(
          expectedMonthLenthsInWeeks,
        )
      })
    })
  })
  describe('given December as last month of year', () => {
    it('the gregorian year ends in December of the given year', () => {
      const options = {
        weekGrouping: WeekGrouping.Group445,
        lastDayOfWeek: LastDayOfWeek.Saturday,
        lastMonthOfYear: LastMonthOfYear.December,
        weekCalculation: WeekCalculation.LastDayNearestEOM,
        restated: true,
      }
      const calendar = new RetailCalendarFactory(options, 2019)
      expect(calendar.months[11].gregorianStartDate.getFullYear()).toBe(2019)
    })
  })
})
