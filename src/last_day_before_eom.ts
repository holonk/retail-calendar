import moment from 'moment'
import { LastDayStrategy } from './types'

export class LastDayBeforeEOMStrategy implements LastDayStrategy {
  getLastDayForGregorianLastDay(
    lastDayOfGregorianYear: moment.Moment,
    lastDayOfIsoWeek: number,
  ): moment.Moment {
    const candidate = moment(lastDayOfGregorianYear).isoWeekday(
      lastDayOfIsoWeek,
    )

    if (candidate.month() !== lastDayOfGregorianYear.month()) {
      candidate.subtract(1, 'week')
    }
    return candidate
  }
}
