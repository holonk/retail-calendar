import { RetailCalendarOptions} from '../types'

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
  return Object.entries(retailCalendarOptions)
      .map((e) => e.join(':'))
      .join('-')
}

