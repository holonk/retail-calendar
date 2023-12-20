import {NRFCalendarOptions, RetailCalendarOptions, WeekCalculation} from "../src";
import {createMemoizationKeyFromCalendarOptionsAndYear} from "../src/utils/memoization";

describe("createMemoizationKeyFromCalendarOptionsAndYear", () => {
   it("creates different keys for different custom leap year options", () => {
        const commonOptions = NRFCalendarOptions;
        const customLeapYearOptions1 = {
            ...NRFCalendarOptions,
            weekCalculation: WeekCalculation.CustomLeapYear,
            customLeapYearOptions: {
                calendarYear: 2006,
                yearEndDate: "2006-03-11",
                leapYearFrequency: 6,
            }
        }
        const customLeapYearOptions2 = {
            ...NRFCalendarOptions,
            weekCalculation: WeekCalculation.CustomLeapYear,
            customLeapYearOptions: {
                calendarYear: 2006,
                yearEndDate: "2006-03-11",
                leapYearFrequency: 7,
            }
        }
        expect(createMemoizationKeyFromCalendarOptionsAndYear(customLeapYearOptions1, 2020))
            .not.toEqual(createMemoizationKeyFromCalendarOptionsAndYear(customLeapYearOptions2, 2020));
   });

   it("takes less than 30ms to create 10000 different keys", () => {
        const calendarConfigurations = Array.from({length: 10000}, () => generateNRFCalendarOptionWithRandomCustomLeapYearOptions());
       const start = Date.now();
         calendarConfigurations.forEach(calendarConfiguration => {
              createMemoizationKeyFromCalendarOptionsAndYear(calendarConfiguration, 2020);
         });
         const end = Date.now();
         expect(end - start).toBeLessThan(30);
   })
});


function generateNRFCalendarOptionWithRandomCustomLeapYearOptions(): RetailCalendarOptions {
    return {
        ...NRFCalendarOptions,
        weekCalculation: WeekCalculation.CustomLeapYear,
        customLeapYearOptions: {
            // Calendar year between 1988 and 50000
            calendarYear: Math.floor(Math.random() * (50000 - 1988 + 1)) + 1988,
            yearEndDate: "2006-03-11",
            leapYearFrequency: 6,
        }
    }
}
