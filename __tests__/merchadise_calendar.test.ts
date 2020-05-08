import { MerchandiseCalendarFactory } from '../src/merchandise_calendar'
import {
  MerchandiseCalendarOptions,
  WeekGrouping,
  LastDayOfWeek,
  LastMonthOfYear,
  WeekCalculation,
  NRFCalendarOptions,
} from '../src/types'
import moment = require('moment')

describe('MerchandiseCalendar', () => {
  describe('given NRF calendar options', () => {
    it('numberOfWeeks calculates properly for each year', () => {
      const yearsAndNumberOfWeeks = [
        { year: 2010, numberOfWeeks: 52 },
        { year: 2011, numberOfWeeks: 52 },
        { year: 2012, numberOfWeeks: 53 },
        { year: 2013, numberOfWeeks: 52 },
        { year: 2014, numberOfWeeks: 52 },
        { year: 2015, numberOfWeeks: 52 },
        { year: 2016, numberOfWeeks: 52 },
        { year: 2017, numberOfWeeks: 53 },
        { year: 2018, numberOfWeeks: 52 },
        { year: 2019, numberOfWeeks: 52 },
        { year: 2020, numberOfWeeks: 52 },
        { year: 2021, numberOfWeeks: 52 },
        { year: 2022, numberOfWeeks: 52 },
        { year: 2023, numberOfWeeks: 53 },
      ]
      for (const { year, numberOfWeeks } of yearsAndNumberOfWeeks) {
        const calendar = new MerchandiseCalendarFactory(
          NRFCalendarOptions,
          year,
        )
        expect(calendar.numberOfWeeks).toBe(numberOfWeeks)
      }
    })

    it('returns months with correct number of weeks', () => {
      const calendar = new MerchandiseCalendarFactory(NRFCalendarOptions, 2018)
      const months = calendar.months
      expect(months.length).toBe(12)
      expect(months[0].weeks.length).toBe(4)
      expect(months[1].weeks.length).toBe(5)
      expect(months[2].weeks.length).toBe(4)

      expect(months[3].weeks.length).toBe(4)
      expect(months[4].weeks.length).toBe(5)
      expect(months[5].weeks.length).toBe(4)

      expect(months[6].weeks.length).toBe(4)
      expect(months[7].weeks.length).toBe(5)
      expect(months[8].weeks.length).toBe(4)

      expect(months[9].weeks.length).toBe(4)
      expect(months[10].weeks.length).toBe(5)
      expect(months[11].weeks.length).toBe(4)
    })

    it('returns month with correct start and end dates', () => {
      const calendar = new MerchandiseCalendarFactory(NRFCalendarOptions, 2018)
      const months = calendar.months

      expect(months[0].gregorianStartDate.getTime()).toEqual(
        moment('2018-02-04').toDate().getTime(),
      )
      expect(months[0].gregorianEndDate.getTime()).toEqual(
        moment('2018-03-03').endOf('day').toDate().getTime(),
      )
      expect(months[1].gregorianStartDate.getTime()).toEqual(
        moment('2018-03-04').toDate().getTime(),
      )
      expect(months[1].gregorianEndDate.getTime()).toEqual(
        moment('2018-04-07').endOf('day').toDate().getTime(),
      )
      expect(months[2].gregorianStartDate.getTime()).toEqual(
        moment('2018-04-08').toDate().getTime(),
      )
      expect(months[2].gregorianEndDate.getTime()).toEqual(
        moment('2018-05-05').endOf('day').toDate().getTime(),
      )
    })

    it('returns weeks with corect month', () => {
      const calendar = new MerchandiseCalendarFactory(NRFCalendarOptions, 2018)
      const weeks = calendar.weeks
      expect(weeks[0].monthOfYear).toBe(1)
      expect(weeks[1].monthOfYear).toBe(1)
      expect(weeks[2].monthOfYear).toBe(1)
      expect(weeks[3].monthOfYear).toBe(1)

      expect(weeks[4].monthOfYear).toBe(2)
      expect(weeks[5].monthOfYear).toBe(2)
      expect(weeks[6].monthOfYear).toBe(2)
      expect(weeks[7].monthOfYear).toBe(2)
      expect(weeks[8].monthOfYear).toBe(2)

      expect(weeks[9].monthOfYear).toBe(3)
      expect(weeks[10].monthOfYear).toBe(3)
      expect(weeks[11].monthOfYear).toBe(3)
      expect(weeks[12].monthOfYear).toBe(3)

      expect(weeks[13].monthOfYear).toBe(4)
      expect(weeks[14].monthOfYear).toBe(4)
      expect(weeks[15].monthOfYear).toBe(4)
      expect(weeks[16].monthOfYear).toBe(4)

      expect(weeks[17].monthOfYear).toBe(5)
      expect(weeks[18].monthOfYear).toBe(5)
      expect(weeks[19].monthOfYear).toBe(5)
      expect(weeks[20].monthOfYear).toBe(5)
      expect(weeks[21].monthOfYear).toBe(5)

      expect(weeks[22].monthOfYear).toBe(6)
      expect(weeks[23].monthOfYear).toBe(6)
      expect(weeks[24].monthOfYear).toBe(6)
      expect(weeks[25].monthOfYear).toBe(6)

      expect(weeks[51].monthOfYear).toBe(12)
    })

    it('returns weeks with corect start and end dates', () => {
      const calendar = new MerchandiseCalendarFactory(NRFCalendarOptions, 2018)
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
          const calendar = new MerchandiseCalendarFactory(
            NRFCalendarOptions,
            2017,
          )
          const firstWeek = calendar.weeks[0]
          expect(firstWeek.monthOfYear).toBe(-1)
          expect(firstWeek.weekOfMonth).toBe(-1)
          expect(firstWeek.weekOfYear).toBe(0)

          const firstMonth = calendar.months[0]
          expect(firstMonth.weeks[0]).not.toEqual(firstWeek)
          expect(firstMonth.weeks[0].weekOfYear).toEqual(1)
        })
      })

      describe('when not restated', () => {
        it('does not assign any months to last week', () => {
          const calendar = new MerchandiseCalendarFactory(
            { ...NRFCalendarOptions, restated: false },
            2017,
          )
          const lastWeek = calendar.weeks[52]
          expect(lastWeek.monthOfYear).toBe(-1)
          expect(lastWeek.weekOfMonth).toBe(-1)
          expect(lastWeek.weekOfYear).toBe(52)

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
      const calendarOptions: MerchandiseCalendarOptions = {
        weekGrouping: WeekGrouping.Group454,
        lastDayOfWeek: LastDayOfWeek.Saturday,
        lastMonthOfYear: LastMonthOfYear.August,
        weekCalculation: WeekCalculation.LastDayBeforeEOM,
        restated: false,
      }

      const yearsAndNumberOfWeeks = [
        { year: 2015, numberOfWeeks: 52 },
        { year: 2016, numberOfWeeks: 52 },
        { year: 2017, numberOfWeeks: 52 },
        { year: 2018, numberOfWeeks: 53 },
        { year: 2019, numberOfWeeks: 52 },
        { year: 2020, numberOfWeeks: 52 },
        { year: 2021, numberOfWeeks: 52 },
        { year: 2022, numberOfWeeks: 52 },
        { year: 2023, numberOfWeeks: 53 },
        { year: 2024, numberOfWeeks: 52 },
        { year: 2025, numberOfWeeks: 52 },
        { year: 2026, numberOfWeeks: 52 },
        { year: 2027, numberOfWeeks: 52 },
      ]
      for (const { year, numberOfWeeks } of yearsAndNumberOfWeeks) {
        const calendar = new MerchandiseCalendarFactory(calendarOptions, year)
        expect(calendar.numberOfWeeks).toBe(numberOfWeeks)
      }
    })
  })
})
