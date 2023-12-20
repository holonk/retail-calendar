import {CustomLeapYearOptions, RetailCalendarOptions} from '../types'

export function memoize<T extends (...args: any) => any>(
  func: T,
  resolver?: (...args: Parameters<T>) => any,
): (this: any, ...args: Parameters<T>) => any {
  const memoized = function (this: any, ...args: Parameters<T>) {
    const key = resolver ? resolver.apply(this, args) : args[0]
    const cache = memoized.cache

    if (cache.has(key)) {
      return cache.get(key)
    }
    const result = func.apply(this, args)
    memoized.cache = cache.set(key, result) || cache
    return result
  }
  memoized.cache = new Map()
  return memoized
}

export function createMemoizationKeyFromCalendarOptionsAndYear(
  retailCalendarOptions: RetailCalendarOptions,
  year: number,
) {
  return [stringifyCalendarOptions(retailCalendarOptions), year].join('_')
}

function stringifyCalendarOptions(
  retailCalendarOptions: RetailCalendarOptions,
) {
  const { weekGrouping, lastDayOfWeek, lastMonthOfYear, weekCalculation, addLeapWeekToMonth, beginningMonthIndex, customLeapYearOptions } = retailCalendarOptions
  return `1:${weekGrouping}-2:${lastDayOfWeek}-3:${lastMonthOfYear}-4:${weekCalculation}-5:${addLeapWeekToMonth}-6:${beginningMonthIndex}-7:${customLeapYearOptions?.calendarYear}-8:${customLeapYearOptions?.yearEndDate}-9:${customLeapYearOptions?.leapYearFrequency}`
}

