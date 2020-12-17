import { FirstBOWOfFirstMonth } from '../src/first_bow_of_first_month'
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
import { nrf2018, nrf2017Restated } from './data/nrf_2018'
import { firstBow } from './data/first_bow'
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

    it('returns start date and end of first month on leap years', () => {
      const calendar = new RetailCalendarFactory(NRFCalendarOptions, 2017)
      const monthIndex = 0
      const month = calendar.months[monthIndex]
      const nrfMonth = nrf2017Restated[monthIndex]
      expect(month.gregorianStartDate.getTime()).toEqual(
        moment(nrfMonth.start).startOf('day').toDate().getTime(),
      )
      expect(month.gregorianEndDate.getTime()).toEqual(
        moment(nrfMonth.end).endOf('day').toDate().getTime(),
      )
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

    it('returns quarters', () => {
      const calendar = new RetailCalendarFactory(NRFCalendarOptions, 2018)
      const months = calendar.months
      const weeks = calendar.weeks
      expect(months[0].quarterOfYear).toEqual(1)
      expect(months[1].quarterOfYear).toEqual(1)
      expect(months[2].quarterOfYear).toEqual(1)
      expect(months[3].quarterOfYear).toEqual(2)
      expect(months[4].quarterOfYear).toEqual(2)
      expect(months[5].quarterOfYear).toEqual(2)
      expect(months[6].quarterOfYear).toEqual(3)
      expect(months[7].quarterOfYear).toEqual(3)
      expect(months[8].quarterOfYear).toEqual(3)
      expect(months[9].quarterOfYear).toEqual(4)
      expect(months[10].quarterOfYear).toEqual(4)
      expect(months[11].quarterOfYear).toEqual(4)

      expect(weeks[0].weekOfQuarter).toEqual(0)
      expect(weeks[13].weekOfQuarter).toEqual(0)
      expect(weeks[26].weekOfQuarter).toEqual(0)
      expect(weeks[39].weekOfQuarter).toEqual(0)
      expect(weeks[51].weekOfQuarter).toEqual(12)
    })

    describe('on leap years', () => {
      describe('when restated', () => {
        it('does not assign any months to first week', () => {
          const calendar = new RetailCalendarFactory(NRFCalendarOptions, 2017)
          const firstWeek = calendar.weeks[0]
          expect(firstWeek.monthOfYear).toBe(-1)
          expect(firstWeek.weekOfMonth).toBe(-1)
          expect(firstWeek.weekOfYear).toBe(-1)
          expect(firstWeek.weekOfQuarter).toBe(-1)

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

  describe('given first end of week of first month strategy', () => {
    it('returns month with correct start and end dates', () => {
      const options = {
        weekGrouping: WeekGrouping.Group445,
        lastDayOfWeek: LastDayOfWeek.Saturday,
        lastMonthOfYear: LastMonthOfYear.December,
        weekCalculation: WeekCalculation.FirstBOWOfFirstMonth,
        restated: true,
      }

      for (const yearData of firstBow) {
        const calendar = new RetailCalendarFactory(options, yearData.year)
        for (const month of yearData.months) {
          const calendarMonth = calendar.months[month.monthOfYear]
          expect(calendarMonth.gregorianStartDate.getTime()).toEqual(
            moment(month.start).startOf('day').toDate().getTime(),
          )
          expect(calendarMonth.gregorianEndDate.getTime()).toEqual(
            moment(month.end).endOf('day').toDate().getTime(),
          )
        }
      }
    })
  })

  describe('given beginning month index option', () => {
    it('returns correct monthOfYear value for each month and week', () => {
      const calendar = new RetailCalendarFactory({...NRFCalendarOptions, beginningMonthIndex: 0}, 2018)
      const weeks = calendar.weeks
      // 4, 5, 4 calendar
      const monthOfYearByWeek = [
        ...Array.from({ length: 4 }).fill(0), // First 4 weeks in 1st month
        ...Array.from({ length: 5 }).fill(1), // Then 5 weeks in 2nd month
        ...Array.from({ length: 4 }).fill(2), // Then 4 weeks in 3rd month,
        // this pattern repeats for other quarters
        ...Array.from({ length: 4 }).fill(3),
        ...Array.from({ length: 5 }).fill(4),
        ...Array.from({ length: 4 }).fill(5),
        ...Array.from({ length: 4 }).fill(6),
        ...Array.from({ length: 5 }).fill(7),
        ...Array.from({ length: 4 }).fill(8),
        ...Array.from({ length: 4 }).fill(9),
        ...Array.from({ length: 5 }).fill(10),
        ...Array.from({ length: 4 }).fill(11),
      ]
      for (let index = 0; index < weeks.length; index++) {
        expect(weeks[index].monthOfYear).toBe(monthOfYearByWeek[index])
      }
      for (let index = 0; index < calendar.months.length; index++) {
        expect(calendar.months[index].monthOfYear).toBe(index)
      }
    })

    it('returns correct quarterOfYear value for each month', () => {
      const calendar = new RetailCalendarFactory({...NRFCalendarOptions, beginningMonthIndex: 0}, 2018)
      const months= calendar.months
      expect(months[0].quarterOfYear).toBe(1)
      expect(months[1].quarterOfYear).toBe(1)
      expect(months[2].quarterOfYear).toBe(1)

      expect(months[3].quarterOfYear).toBe(2)
      expect(months[4].quarterOfYear).toBe(2)
      expect(months[5].quarterOfYear).toBe(2)

      expect(months[6].quarterOfYear).toBe(3)
      expect(months[7].quarterOfYear).toBe(3)
      expect(months[8].quarterOfYear).toBe(3)

      expect(months[9].quarterOfYear).toBe(4)
      expect(months[10].quarterOfYear).toBe(4)
      expect(months[11].quarterOfYear).toBe(4)
    })
  })
})
