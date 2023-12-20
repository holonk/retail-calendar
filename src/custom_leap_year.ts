import {CustomLeapYearOptions, LastDayStrategy} from "./types";
import {addWeeksToDate} from "./date_utils";

export class CustomLeapYearStrategy implements LastDayStrategy {
    customLastYearOptions: CustomLeapYearOptions;

    constructor(customLastYearOptions: CustomLeapYearOptions) {
        this.customLastYearOptions = customLastYearOptions;
    }
    getLastDayForGregorianLastDay(
        lastDayOfGregorianYear: Date,
        isoLastDayOfWeek: number,
        retailCalendarYear: number,
    ): Date {
        const { calendarYear: startCalendarYear, yearEndDate: startYearEndDate, leapYearFrequency } = this.customLastYearOptions;
        const yearDifference = retailCalendarYear - startCalendarYear;
        let yearEndDate = new Date(startYearEndDate);
        if (yearDifference > 0) {
            // start at the startCalendarYear + 1, because we already have the end date for the startCalendarYear
            for (let i = startCalendarYear + 1; i <= retailCalendarYear; i += 1) {
                const isLeapYear = Math.abs(i - startCalendarYear) % leapYearFrequency === 0;
                const numberOfWeeks = isLeapYear ? 53 : 52;
                yearEndDate = addWeeksToDate(yearEndDate, numberOfWeeks);
            }
            return yearEndDate;
        } else if (yearDifference < 0) {
            for (let i = startCalendarYear; i > retailCalendarYear; i -= 1) {
                const isLeapYear = Math.abs(i - startCalendarYear) % leapYearFrequency === 0;
                const numberOfWeeks = isLeapYear ? 53 : 52;
                yearEndDate = addWeeksToDate(yearEndDate, -numberOfWeeks);
            }
            return yearEndDate;
        }

        return yearEndDate;
    }

}
