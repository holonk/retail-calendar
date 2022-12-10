import { weekOfGregorianDate } from '../src/gregorian_helpers'
import { NRFCalendarOptions } from '../src/types'

describe('weekOfGregorianDate', () => {
  it("returns week and calendar of given gregorian date", () => {
    const weekAndCalendar = weekOfGregorianDate(new Date(2020, 1, 5), NRFCalendarOptions)
    expect(weekAndCalendar.week.weekOfYear).toBe(0)
    expect(weekAndCalendar.calendar.year).toBe(2020)
  })

  it('finds correct calendar year even if gregorian year and retail calendar year are different', () => {
    const weekAndCalendar = weekOfGregorianDate(new Date(2020, 1, 1), NRFCalendarOptions)
    expect(weekAndCalendar.week.weekOfYear).toBe(51)
    expect(weekAndCalendar.calendar.year).toBe(2019)
  })
})
