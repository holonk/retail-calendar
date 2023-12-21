export function createDateFromYYYYMMDD(dateString: string): Date {
  const [year, month, day] = dateString.split('-').map(parseIntBase10)
  const date = newSafeDate()
  date.setFullYear(year, month - 1, day)
  return date
}

export function newSafeDate(): Date {
  return new Date(2000, 0, 1)
}

export function addDaysToDate(date: Date, days: number): Date {
  const newDate = newSafeDate()
  newDate.setFullYear(date.getFullYear())
  newDate.setMonth(date.getMonth())
  newDate.setDate(date.getDate() + days)
  newDate.setHours(date.getHours())
  newDate.setMinutes(date.getMinutes())
  newDate.setSeconds(date.getSeconds())
  newDate.setMilliseconds(date.getMilliseconds())
  return newDate
}

export function addWeeksToDate(date: Date, weeks: number): Date {
  return addDaysToDate(date, weeks * 7)
}

export function startOfDay(date: Date): Date {
  const newDate = new Date(date)
  newDate.setHours(0, 0, 0, 0)
  return newDate
}

export function endOfDay(date: Date): Date {
  const newDate = new Date(date)
  newDate.setHours(23, 59, 59, 999)
  return newDate
}

export function endOfMonth(date: Date): Date {
  const newDate = new Date(date)
  newDate.setMonth(newDate.getMonth() + 1, 0)
  newDate.setHours(23, 59, 59, 999)
  return newDate
}

export function endOfYear(date: Date): Date {
  const newDate = new Date(date)
  newDate.setMonth(11, 31)
  newDate.setHours(23, 59, 59, 999)
  return newDate
}

export function getDayDifference(date1: Date, date2: Date): number {
  const diff = date1.getTime() - date2.getTime()
  return Math.floor(diff / (1000 * 60 * 60 * 24))
}

export function getWeekDifference(date1: Date, date2: Date): number {
  const diff = date1.getTime() - date2.getTime()
  return Math.floor(diff / (1000 * 60 * 60 * 24 * 7))
}

/**
 *
 * @returns 1 for Monday, 2 for Tuesday, etc. 7 for Sunday
 */
export function getIsoWeekDay(date: Date): number {
  // 0 is Sunday, 1 is Monday, etc.
  return date.getDay() === 0 ? 7 : date.getDay()
}

export function setIsoWeekDay(date: Date, day: number): Date {
  const distance = day - getIsoWeekDay(date)
  return addDaysToDate(date, distance)
}

export function getDayOfYear(date: Date): number {
  const millisecondsInDay = 1000 * 60 * 60 * 24
  return (
    (Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) -
      Date.UTC(date.getFullYear(), 0, 0)) /
    millisecondsInDay
  )
}

/**
 * Returns formatted string in (YYYY-MM-DD) format
 */
export function toFormattedString(date: Date): string {
  // ISO string is in UTC, so we need to convert it to local time by subtracting the timezone offset.
  const millisecondsInMinute = 1000 * 60
  return new Date(
    date.getTime() - date.getTimezoneOffset() * millisecondsInMinute,
  )
    .toISOString()
    .split('T')[0]
}

export function parseIntBase10(value: string): number {
  return parseInt(value, 10)
}
