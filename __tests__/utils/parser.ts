import { endOfDay, startOfDay } from "../../src/date_utils"

export function parseStartDate(startDate: string): Date {
    const [year, month, day] = startDate.split('-')
    return startOfDay(new Date(parseInt(year), parseInt(month) - 1, parseInt(day)))
}

export function parseEndDate(endDate: string): Date {
    const [year, month, day] = endDate.split('-')
    return endOfDay(new Date(parseInt(year), parseInt(month) - 1, parseInt(day)))
}