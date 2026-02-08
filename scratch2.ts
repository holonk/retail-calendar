import { RetailCalendarFactory, NRFCalendarOptions } from './src'

const cal = RetailCalendarFactory.getRetailCalendar(
  { ...NRFCalendarOptions, addLeapWeekToMonth: 9 },
  2028,
)

cal.weeks.forEach((week) => {
  console.log(
    `Week ${week.weekOfYear}: month ${week.monthOfYear}, ${week.gregorianStartDate.toISOString().slice(0, 10)} - ${week.gregorianEndDate.toISOString().slice(0, 10)}`,
  )
})
