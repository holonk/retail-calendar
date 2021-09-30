import { LastDayBeforeEOMStrategy } from './last_day_before_eom'
import moment from 'moment'
import { LastDayStrategy } from './types'

export class LastDayBeforeEOMExceptLeapYearStrategy implements LastDayStrategy {
  getLastDayForGregorianLastDay(
    lastDayOfGregorianYear: moment.Moment,
    lastDayOfIsoWeek: number,
  ): moment.Moment {
    const lastDayOfNextGregorianYear = moment(lastDayOfGregorianYear)
      .add(1, 'day')
      .endOf('year')
    const lastDayOfThisYear = new LastDayBeforeEOMStrategy().getLastDayForGregorianLastDay(
      lastDayOfGregorianYear,
      lastDayOfIsoWeek,
    )
    const lastDayOfNextYear = new LastDayBeforeEOMStrategy().getLastDayForGregorianLastDay(
      lastDayOfNextGregorianYear,
      lastDayOfIsoWeek,
    )

    if (lastDayOfNextYear.diff(lastDayOfThisYear, 'week') === 53) {
      return moment(lastDayOfThisYear).add(1, 'week')
    }

    return lastDayOfThisYear
  }
}
