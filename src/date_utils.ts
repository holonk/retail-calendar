export function addDaysToDate(date: Date, days: number): Date {
    const newDate = new Date(date)
    newDate.setDate(newDate.getDate() + days)
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
    return (Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) - Date.UTC(date.getFullYear(), 0, 0)) / millisecondsInDay;
}

export function toFormattedString(date: Date): string {
    return date.toISOString().split('T')[0]
}