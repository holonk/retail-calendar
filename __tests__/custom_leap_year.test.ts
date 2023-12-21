import {
    LastDayOfWeek,
    LastMonthOfYear,
    RetailCalendarFactory,
    RetailCalendarOptions,
    WeekCalculation,
    WeekGrouping
} from "../src";
import {createDateFromYYYYMMDD, endOfDay, newSafeDate, startOfDay} from "../src/date_utils";

describe("Given CustomLeapYear calendar options", () => {
    let customLeapYearCalendarOptions: RetailCalendarOptions;
    beforeEach(() => {
        customLeapYearCalendarOptions = {
            weekCalculation: WeekCalculation.CustomLeapYear,
            lastDayOfWeek:LastDayOfWeek.Saturday,
            lastMonthOfYear: LastMonthOfYear.February,
            weekGrouping: WeekGrouping.Group454,
            leapYear: 2005,
            leapYearEndDate: "2006-03-11", // 2006 March 11th, Saturday
            leapYearFrequency: 6,
        };
    });
    // 2005 2011 2017 2023

    it("should return 53 for first given leap year", () => {
       const retailCalendar = RetailCalendarFactory.getRetailCalendar(customLeapYearCalendarOptions, 2005);
         expect(retailCalendar.weeks.length).toEqual(53);
         expect(retailCalendar.weeks[0].gregorianStartDate).toEqual(startOfDay(createDateFromYYYYMMDD('2005-03-06')));
         expect(retailCalendar.weeks[52].gregorianEndDate).toEqual(endOfDay(createDateFromYYYYMMDD("2006-03-11")));
    });

    it("should return 53 weeks for year 2024", () => {
        const retailCalendar = RetailCalendarFactory.getRetailCalendar(customLeapYearCalendarOptions, 2023);
        expect(retailCalendar.weeks.length).toEqual(53);
    });

    it('should return 53 weeks for a past leap year', () => {
        const retailCalendar = RetailCalendarFactory.getRetailCalendar(customLeapYearCalendarOptions, 1999);
        expect(retailCalendar.weeks.length).toEqual(53);
    });

    it("should return correct end date for years between 2005 to 2030", () => {

        // From 2005 to 2030
        const expectedEndDateStrings = [
            '2006-03-11',
            '2007-03-10',
            '2008-03-08',
            '2009-03-07',
            '2010-03-06',
            '2011-03-05',
            '2012-03-10',
            '2013-03-09',
            '2014-03-08',
            '2015-03-07',
            '2016-03-05',
            '2017-03-04',
            '2018-03-10',
            '2019-03-09',
            '2020-03-07',
            '2021-03-06',
            '2022-03-05',
            '2023-03-04',
            '2024-03-09',
            '2025-03-08',
            '2026-03-07',
            '2027-03-06',
            '2028-03-04',
            '2029-03-03',
            '2030-03-09',
        ];
        const expectedEndDates: Date[] = expectedEndDateStrings.map(createDateFromYYYYMMDD).map(endOfDay);
        for (let i = 2005; i < 2030; i++) {
            const retailCalendar = RetailCalendarFactory.getRetailCalendar(customLeapYearCalendarOptions, i);
            expect(retailCalendar.weeks[retailCalendar.weeks.length - 1].gregorianEndDate).toEqual(expectedEndDates[i - 2005]);
            console.log(`Year ${i} end date: ${retailCalendar.weeks[retailCalendar.weeks.length - 1].gregorianEndDate}`);
        }
    });
});
