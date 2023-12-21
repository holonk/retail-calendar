import {NRFCalendarOptions, RetailCalendarOptions, WeekCalculation} from "../src";
import {createMemoizationKeyFromCalendarOptionsAndYear} from "../src/utils/memoization";

describe("createMemoizationKeyFromCalendarOptionsAndYear", () => {
   it("creates different keys for different custom leap year options", () => {
        const commonOptions = NRFCalendarOptions;
        const customLeapYearOptions1 = {
            ...NRFCalendarOptions,
            weekCalculation: WeekCalculation.CustomLeapYear,
            leapYear: 2006,
            leapYearEndDate: "2006-03-11",
            leapYearFrequency: 6,
        }
        const customLeapYearOptions2 = {
            ...NRFCalendarOptions,
            weekCalculation: WeekCalculation.CustomLeapYear,
            leapYear: 2006,
            leapYearEndDate: "2006-03-11",
            leapYearFrequency: 7,
        }
        expect(createMemoizationKeyFromCalendarOptionsAndYear(customLeapYearOptions1, 2020))
            .not.toEqual(createMemoizationKeyFromCalendarOptionsAndYear(customLeapYearOptions2, 2020));
   });

});
