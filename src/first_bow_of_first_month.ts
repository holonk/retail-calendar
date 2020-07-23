import moment from 'moment'
import { LastDayStrategy } from './types'

export class FirstBOWOfFirstMonth implements LastDayStrategy {
  getLastDayForGregorianLastDay(
    lastDayOfGregorianYear: moment.Moment,
    lastDayOfIsoWeek: number,
  ): moment.Moment {
    const firstDayOfIsoWeek = lastDayOfIsoWeek === 7 ? 1 : lastDayOfIsoWeek + 1
    const lastMonth = lastDayOfGregorianYear.month()
    const mutableLastDay = moment(lastDayOfGregorianYear)
    // Go to the next month, i.e start month of next year
    mutableLastDay.add(1, 'day')
    // Find the first day which is a start of the week
    while (mutableLastDay.isoWeekday() !== firstDayOfIsoWeek) {
      mutableLastDay.add(1, 'day')
    }
    // That was the start of next year
    // Go back by one day and find end of this year.
    mutableLastDay.add(-1, 'day')
    return mutableLastDay
  }
}
