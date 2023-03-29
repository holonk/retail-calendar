import { endOfDay, startOfDay } from "../../src/date_utils"

export function parseStartDate(startDate: string): Date {
    const [year, month, day] = startDate.split('-')
    const date = new Date()
    date.setFullYear(parseInt(year))
    date.setMonth(parseInt(month) - 1)
    date.setDate(parseInt(day))
    return startOfDay(date)
}

export function parseEndDate(endDate: string): Date {
    const [year, month, day] = endDate.split('-')
    const date = new Date()
    date.setFullYear(parseInt(year))
    date.setMonth(parseInt(month) - 1)
    date.setDate(parseInt(day))
    return endOfDay(date)
}