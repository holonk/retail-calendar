import { LastDayBeforeEOMExceptLeapYearStrategy } from '../src/last_day_before_eom_except_leap_year';
import { LastDayBeforeEOMStrategy } from './../src/last_day_before_eom';
import { FirstBOWOfFirstMonth } from '../src/first_bow_of_first_month'
import { RetailCalendarFactory } from '../src/retail_calendar'
import {
  RetailCalendarOptions,
  WeekGrouping,
  LastDayOfWeek,
  LastMonthOfYear,
  WeekCalculation,
  NRFCalendarOptions,
  RetailCalendar,
} from '../src/types'
import { nrfYears } from './data/nrf_years'
import { lastDayBeforeEOMYears } from './data/last_day_before_eom_years'
import { nrf2018, nrf2017NotRestated } from './data/nrf_2018'
import { firstBow } from './data/first_bow'
import { lastDayBeforeEomExceptLeapYear } from './data/last_day_before_eom_except_leap_year';
import { lastDayNearestEOM445PenultimateWeeks } from './data/last_day_nearest_eom_445_penultimate_weeks';
import { endOfDay, startOfDay, toFormattedString } from '../src/date_utils';
import { parseEndDate, parseStartDate } from './utils/parser';


describe('RetailCalendar', () => {

  describe("addLeapWeekToPenultimateMonth option", () => {
    it("defaults to false", () => {
      const calendar = new RetailCalendarFactory(NRFCalendarOptions, 2022)
      expect(calendar.addLeapWeekToPenultimateMonth).toBe(false)
    })
    it("given true, RetailCalendar.addLeapWeekToPenultimateMonth is true", () => {
      const calendar = new RetailCalendarFactory({ ...NRFCalendarOptions, addLeapWeekToPenultimateMonth: true }, 2022)
      expect(calendar.addLeapWeekToPenultimateMonth).toBe(true)
    })
  })

  describe('Given Last Day Nearest EOM, 445, Penultimate Leap Year', () => {

    it('returns the right data for each week of 2022', () => {
      const calendar = new RetailCalendarFactory({
        weekCalculation: WeekCalculation.LastDayNearestEOM,
        weekGrouping: WeekGrouping.Group445,
        lastDayOfWeek: LastDayOfWeek.Friday,
        lastMonthOfYear: LastMonthOfYear.January,
        addLeapWeekToPenultimateMonth: true,
      }, 2022)

      for (let weekIndex = 0; weekIndex < lastDayNearestEOM445PenultimateWeeks.length; weekIndex++) {
        const expectedWeek = lastDayNearestEOM445PenultimateWeeks[weekIndex];
        const actualWeek = calendar.weeks[weekIndex];
        expect(actualWeek).toBeTheSameWeekAs(expectedWeek)
      }
    })
  })

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
      const expectedMonthLengthsInWeeks = [4, 5, 4, 4, 5, 4, 4, 5, 4, 4, 5, 4]
      expect(months.length).toBe(12)
      expect(months.map((month) => month.weeks.length)).toEqual(
        expectedMonthLengthsInWeeks,
      )
    })  

    it('returns month with correct start and end dates', () => {
      const calendar = new RetailCalendarFactory(NRFCalendarOptions, 2018)
      for (let index = 0; index < 12; index++) {
        const month = calendar.months[index]
        const nrfMonth = nrf2018[index]
        const expectedStart = parseStartDate(nrfMonth.start);
        const expectedEnd = parseEndDate(nrfMonth.end);
        expect(month.gregorianStartDate.getTime()).toEqual(expectedStart.getTime())
        expect(month.gregorianEndDate.getTime()).toEqual(expectedEnd.getTime())
      }
    })

    it('returns start date and end of first month on leap years', () => {
      const calendar = new RetailCalendarFactory(NRFCalendarOptions, 2017)
      const monthIndex = 0
      const month = calendar.months[monthIndex]
      const nrfMonth = nrf2017NotRestated[monthIndex]
      expect(month.gregorianStartDate.getTime()).toEqual(
        parseStartDate(nrfMonth.start).getTime(),
      )
      expect(month.gregorianEndDate.getTime()).toEqual(
        parseEndDate(nrfMonth.end).getTime(),
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
        parseStartDate('2018-02-04').getTime(),
      )
      expect(weeks[0].gregorianEndDate.getTime()).toEqual(
        parseEndDate('2018-02-10').getTime(),
      )

      expect(weeks[1].gregorianStartDate.getTime()).toEqual(
        parseStartDate('2018-02-11').getTime(),
      )
      expect(weeks[1].gregorianEndDate.getTime()).toEqual(
        parseEndDate('2018-02-17').getTime(),
      )
    })

    it("returns weeks with 0 indexed weekOfYear", () => {
      const calendar = new RetailCalendarFactory(NRFCalendarOptions, 2018)
      const expectedNumberOfWeeks = 52
      const weeks = calendar.weeks
      expect(weeks.length).toBe(expectedNumberOfWeeks)
      for (let index = 0; index < weeks.length; index++) {
        expect(weeks[index].weekOfYear).toBe(index)
      }        
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

      describe('when inserting a week in penultimate month', () => {
        let calendar: RetailCalendar;

        beforeEach(() => {
          calendar = new RetailCalendarFactory(
            { ...NRFCalendarOptions, weekGrouping: WeekGrouping.Group445, addLeapWeekToPenultimateMonth: true },
            2017,
          )
        })
        it('keeps the first week in the year', () => {
          const firstWeek = calendar.weeks[0]
          expect(firstWeek.monthOfYear).toBe(1)
          expect(firstWeek.weekOfMonth).toBe(0)
          expect(firstWeek.weekOfYear).toBe(0)
          expect(firstWeek.weekOfQuarter).toBe(0)
          const firstMonth = calendar.months[0]
          expect(firstMonth.weeks[0]).toEqual(firstWeek)
          expect(firstMonth.weeks[0].weekOfYear).toEqual(0)
        })
        it('keeps the last week in the year', () => {
          const lastWeek = calendar.weeks[52]
          expect(lastWeek.monthOfYear).toBe(12)
          expect(lastWeek.weekOfMonth).toBe(4)
          expect(lastWeek.weekOfYear).toBe(52)
        })
        it('adds a week to the 11th month', () => {
          const expectedMonthLengthsInWeeks = [4, 4, 5, 4, 4, 5, 4, 4, 5, 4, 5, 5]
          const actualMonthLengthsInWeeks = calendar.months.map((month) => month.weeks.length)

          expect(expectedMonthLengthsInWeeks).toEqual(actualMonthLengthsInWeeks)

          const secondWeekInYear = calendar.weeks[1]
          expect(secondWeekInYear.weekOfYear).toBe(1)

        })
      })

      describe('when not restated', () => {
        const notRestatedCalendarOptions = NRFCalendarOptions

        it("does not return a week -1", () => {
          const calendar = new RetailCalendarFactory(notRestatedCalendarOptions, 2017)
          const leapWeek = calendar.weeks.find((week) => week.weekOfYear === -1)

          expect(leapWeek).toBeUndefined()
        });

        it("returns week 52 as the last week of the year", () => {
          const calendar = new RetailCalendarFactory(notRestatedCalendarOptions, 2017)
          const lastWeek = calendar.weeks[52]
          expect(calendar.weeks).toHaveLength(53)
          expect(lastWeek.monthOfYear).toBe(-1)
          expect(lastWeek.weekOfMonth).toBe(-1)
          expect(lastWeek.weekOfYear).toBe(52)
        });

        it("assigns first 52 weeks to months and quarters", () => {
          const calendar = new RetailCalendarFactory(notRestatedCalendarOptions, 2017)
          const first52Weeks = calendar.weeks.slice(0, 52)
          // 4 weeks in Jan, 5 in Feb, 4 in Mar and repeats in each quarter
          // Check that the first 52 weeks are assigned to months and quarters correctly
          first52Weeks.forEach((week, index) => {
            const expectedQuarterOfYear = Math.floor(index / 13) + 1;
            const expectedWeekOfQuarter = (index % 13);
            expect(week.quarterOfYear).toBe(expectedQuarterOfYear);
            expect(week.weekOfQuarter).toBe(expectedWeekOfQuarter);
          });
        });

        it('does not assign any months to last week', () => {
          const calendar = new RetailCalendarFactory( notRestatedCalendarOptions, 2017)
          const lastWeek = calendar.weeks[52]

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
      }

      for (const yearData of firstBow) {
        const calendar = new RetailCalendarFactory(options, yearData.year)
        for (const month of yearData.months) {
          const calendarMonth = calendar.months[month.monthOfYear]
          expect(calendarMonth.gregorianStartDate.getTime()).toEqual(
            parseStartDate(month.start).getTime(),
          )
          expect(calendarMonth.gregorianEndDate.getTime()).toEqual(
            parseEndDate(month.end).getTime(),
          )
        }
      }
    })
  })

  describe('given beginning month index option', () => {
    it('returns correct monthOfYear value for each month and week', () => {
      const calendar = new RetailCalendarFactory({ ...NRFCalendarOptions, beginningMonthIndex: 0 }, 2018)
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
      const calendar = new RetailCalendarFactory({ ...NRFCalendarOptions, beginningMonthIndex: 0 }, 2018)
      const months = calendar.months
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

  describe('given "last day nearest end of month except restated" week calculation method', () => {

    it('it moves 53rd week to previous year', () => {
      const options = {
        weekGrouping: WeekGrouping.Group445,
        lastDayOfWeek: LastDayOfWeek.Saturday,
        lastMonthOfYear: LastMonthOfYear.December,
        weekCalculation: WeekCalculation.LastDayBeforeEomExceptLeapYear,
      }

      for (const yearData of lastDayBeforeEomExceptLeapYear) {
        const calendar = new RetailCalendarFactory(options, yearData.year)
        for (const month of yearData.months) {
          const calendarMonth = calendar.months[month.monthOfYear]
          expect(toFormattedString(calendarMonth.gregorianStartDate))
            .toEqual(month.start)
          expect(toFormattedString(calendarMonth.gregorianEndDate)).toEqual(
            month.end
          )
        }
        if (yearData.leapWeek) {
          const leapWeek = calendar.weeks[52]
          expect(toFormattedString(leapWeek.gregorianStartDate)).toEqual(yearData.leapWeek.start)
          expect(toFormattedString(leapWeek.gregorianEndDate)).toEqual(yearData.leapWeek.end)
        }
      }
    })
  })

  describe("given 0 year", () => {
    it("it does not generate more than 53 weeks", () => {
      const options: RetailCalendarOptions = {
        weekGrouping: WeekGrouping.Group454,
        lastDayOfWeek: LastDayOfWeek.Saturday,
        lastMonthOfYear: LastMonthOfYear.December,
        weekCalculation: WeekCalculation.LastDayNearestEOM,
        beginningMonthIndex: 0
      };
      const calendar = new RetailCalendarFactory(options, 0);
      expect(calendar.weeks.length).toBeLessThanOrEqual(53);
    })
  })
})
