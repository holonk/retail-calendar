import { endOfDay, newSafeDate, startOfDay } from "../../src/date_utils"

export function parseStartDate(startDate: string): Date {
    const [year, month, day] = startDate.split('-')
    const date = newSafeDate()
    date.setFullYear(parseInt(year))
    date.setMonth(parseInt(month) - 1, parseInt(day))
    return startOfDay(date)
}

export function parseEndDate(endDate: string): Date {
    const [year, month, day] = endDate.split('-')
    const date = newSafeDate()
    date.setFullYear(parseInt(year))
    date.setMonth(parseInt(month) - 1, parseInt(day))
    return endOfDay(date)
}