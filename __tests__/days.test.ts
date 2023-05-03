import { RetailCalendarFactory } from "../src/retail_calendar"
import { NRFCalendarOptions, RetailCalendar } from "../src/types"

describe("RetailCalendar", () => {
    describe("given NRF calendar on a non-leap year", () => {
        let calendar: RetailCalendar;
        beforeEach(() => {
            calendar = new RetailCalendarFactory(NRFCalendarOptions, 2022)
        });

        it("should have 52 * 7 days", () => {
            expect(calendar.days.length).toBe(52 * 7)
        });

        it("should return correct first day information", () => {
            const firstDay = calendar.days[0]
            expect(firstDay.dayOfMonth).toBe(1)
            expect(firstDay.dayOfWeek).toBe(1)
            expect(firstDay.dayOfYear).toBe(1)
            expect(firstDay.monthOfYear).toBe(1)
            expect(firstDay.weekOfYear).toBe(0)
            expect(firstDay.gregorianDayOfYear).toBe(30)
            expect(firstDay.gregorianMonthOfYear).toBe(1) // January
            expect(firstDay.gregorianStartDate).toEqual(new Date(2022, 0, 30)) // January 30th 2022
            expect(firstDay.gregorianEndDate).toEqual(new Date(2022, 0, 30, 23, 59, 59, 999)) // January 30th 2022
        });

        it("should return correct second day information", () => {
            const secondDay = calendar.days[1]
            expect(secondDay.dayOfMonth).toBe(2)
            expect(secondDay.dayOfWeek).toBe(2)
            expect(secondDay.dayOfYear).toBe(2)
            expect(secondDay.monthOfYear).toBe(1)
            expect(secondDay.weekOfYear).toBe(0)
            expect(secondDay.gregorianDayOfYear).toBe(31)
            expect(secondDay.gregorianMonthOfYear).toBe(1) // January
            expect(secondDay.gregorianStartDate).toEqual(new Date(2022, 0, 31)) // January 31th 2022
            expect(secondDay.gregorianEndDate).toEqual(new Date(2022, 0, 31, 23, 59, 59, 999)) // January 31th 2022
        });

        it("should return correct third day information", () => {
            const thirdDay = calendar.days[2]
            expect(thirdDay.dayOfMonth).toBe(3)
            expect(thirdDay.dayOfWeek).toBe(3)
            expect(thirdDay.dayOfYear).toBe(3)
            expect(thirdDay.monthOfYear).toBe(1)
            expect(thirdDay.weekOfYear).toBe(0)
            expect(thirdDay.gregorianDayOfYear).toBe(32)
            expect(thirdDay.gregorianMonthOfYear).toBe(2) // February
            expect(thirdDay.gregorianStartDate).toEqual(new Date(2022, 1, 1)) // February 1st 2022
            expect(thirdDay.gregorianEndDate).toEqual(new Date(2022, 1, 1, 23, 59, 59, 999)) // February 1st 2022
        });

        it("should return correct last day information", () => {
            const lastDay = calendar.days[52 * 7 - 1]
            expect(lastDay.dayOfMonth).toBe(28)
            expect(lastDay.dayOfWeek).toBe(7)
            expect(lastDay.dayOfYear).toBe(364)
            expect(lastDay.monthOfYear).toBe(12)
            expect(lastDay.weekOfYear).toBe(51)
            expect(lastDay.gregorianDayOfYear).toBe(28)
            expect(lastDay.gregorianMonthOfYear).toBe(1) // January
            expect(lastDay.gregorianStartDate).toEqual(new Date(2023, 0, 28)) // January 28th 2023
            expect(lastDay.gregorianEndDate).toEqual(new Date(2023, 0, 28, 23, 59, 59, 999)) // January 28th 2023
            expect(lastDay.gregorianDayOfMonth).toEqual(28)
        });

        it("should return correct random day information", () => {
            const lastDay = calendar.days[31 * 7 + 1] // 32st week, 2nd day
            expect(lastDay.dayOfMonth).toBe(9)
            expect(lastDay.dayOfWeek).toBe(2)
            expect(lastDay.dayOfYear).toBe(31 * 7 + 2)
            expect(lastDay.monthOfYear).toBe(8)
            expect(lastDay.weekOfYear).toBe(31)
            expect(lastDay.gregorianDayOfYear).toBe(248)
            expect(lastDay.gregorianMonthOfYear).toBe(9) // September
            expect(lastDay.gregorianStartDate).toEqual(new Date(2022, 8, 5)) // September 5th 2022
            expect(lastDay.gregorianEndDate).toEqual(new Date(2022, 8, 5, 23, 59, 59, 999)) // September 5th 2022
        });
    });

    describe("given NRF calendar on a leap year", () => {
        let calendar: RetailCalendar;
        beforeEach(() => {
            calendar = new RetailCalendarFactory(NRFCalendarOptions, 2023)
        });

        it("should have 53 * 7 days", () => {
            expect(calendar.days.length).toBe(53 * 7)
        });

        it("should return correct first day information", () => {
            const firstDay = calendar.days[0]
            expect(firstDay.dayOfWeek).toBe(1)
            expect(firstDay.dayOfMonth).toBe(1)
            expect(firstDay.dayOfYear).toBe(1)
            expect(firstDay.monthOfYear).toBe(1)
            expect(firstDay.weekOfYear).toBe(0)
            expect(firstDay.gregorianDayOfYear).toBe(29)
            expect(firstDay.gregorianMonthOfYear).toBe(1) // January
            expect(firstDay.gregorianStartDate).toEqual(new Date(2023, 0, 29)) // January 29th 2023
            expect(firstDay.gregorianEndDate).toEqual(new Date(2023, 0, 29, 23, 59, 59, 999)) // January 29th 2023
        });

        it("should return correct second day information", () => {
            const secondDay = calendar.days[1]
            expect(secondDay.dayOfWeek).toBe(2)
            expect(secondDay.dayOfMonth).toBe(2)
            expect(secondDay.dayOfYear).toBe(2)
            expect(secondDay.monthOfYear).toBe(1)
            expect(secondDay.weekOfYear).toBe(0)
            expect(secondDay.gregorianDayOfYear).toBe(30)
            expect(secondDay.gregorianMonthOfYear).toBe(1) // January
            expect(secondDay.gregorianStartDate).toEqual(new Date(2023, 0, 30)) // January 30th 2023
            expect(secondDay.gregorianEndDate).toEqual(new Date(2023, 0, 30, 23, 59, 59, 999)) // January 30th 2023
        });

        it("should return correct third day information", () => {
            const thirdDay = calendar.days[2]
            expect(thirdDay.dayOfWeek).toBe(3)
            expect(thirdDay.dayOfMonth).toBe(3)
            expect(thirdDay.dayOfYear).toBe(3)
            expect(thirdDay.monthOfYear).toBe(1)
            expect(thirdDay.weekOfYear).toBe(0)
            expect(thirdDay.gregorianDayOfYear).toBe(31)
            expect(thirdDay.gregorianMonthOfYear).toBe(1) // January
            expect(thirdDay.gregorianStartDate).toEqual(new Date(2023, 0, 31)) // January 31th 2023
            expect(thirdDay.gregorianEndDate).toEqual(new Date(2023, 0, 31, 23, 59, 59, 999)) // January 31th 2023
        });

        it("should return correct last day information", () => {
            const lastDay = calendar.days[53 * 7 - 1]
            expect(lastDay.dayOfMonth).toBe(-1)
            expect(lastDay.dayOfWeek).toBe(7)
            expect(lastDay.dayOfYear).toBe(371)
            expect(lastDay.monthOfYear).toBe(-1)
            expect(lastDay.weekOfYear).toBe(52)
            expect(lastDay.gregorianDayOfYear).toBe(34)
            expect(lastDay.gregorianMonthOfYear).toBe(2) // February
            expect(lastDay.gregorianStartDate).toEqual(new Date(2024, 1, 3)) // Feb 3rd 2024
            expect(lastDay.gregorianEndDate).toEqual(new Date(2024, 1, 3, 23, 59, 59, 999)) // Feb 3rd 2024
            expect(lastDay.gregorianDayOfMonth).toEqual(3)
        });

        it("should return correct random day information", () => {
            const randomDay = calendar.days[31 * 7 + 1] // 32nd week, 2nd day
            expect(randomDay.dayOfMonth).toBe(9)
            expect(randomDay.dayOfWeek).toBe(2)
            expect(randomDay.dayOfYear).toBe(31 * 7 + 2)
            expect(randomDay.monthOfYear).toBe(8)
            expect(randomDay.weekOfYear).toBe(31)
            expect(randomDay.gregorianDayOfYear).toBe(247)
            expect(randomDay.gregorianMonthOfYear).toBe(9) // September
            expect(randomDay.gregorianStartDate).toEqual(new Date(2023, 8, 4)) // September 4th 2023
            expect(randomDay.gregorianEndDate).toEqual(new Date(2023, 8, 4, 23, 59, 59, 999)) // September 4th 2023
            expect(randomDay.gregorianDayOfMonth).toEqual(4)
        });
    });
})