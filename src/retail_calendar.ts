import {
  RetailCalendar,
  RetailCalendarConstructor,
  RetailCalendarMonth,
  RetailCalendarOptions,
  RetailCalendarWeek,
  WeekCalculation,
  WeekGrouping,
  LastDayStrategy,
  LastMonthOfYear,
  RetailCalendarDay,
  RetailMonth,
} from "./types";

import { CalendarMonth } from "./calendar_month";
import { CalendarWeek } from "./calendar_week";
import { LastDayBeforeEOMStrategy } from "./last_day_before_eom";
import { LastDayNearestEOMStrategy } from "./last_day_nearest_eom";
import { FirstBOWOfFirstMonth } from "./first_bow_of_first_month";
import { LastDayBeforeEOMExceptLeapYearStrategy } from "./last_day_before_eom_except_leap_year";
import {
  addDaysToDate,
  addWeeksToDate,
  endOfDay,
  endOfMonth,
  getDayOfYear,
  getDayDifference,
  getWeekDifference,
  newSafeDate,
  startOfDay,
} from "./date_utils";
import {
  createMemoizationKeyFromCalendarOptionsAndYear,
  memoize,
} from "./utils/memoization";
import { PenultimateDayOfWeekNearestEOMStrategy } from "./penultimate_day_of_week_nearest_eom";
import { CustomLeapYearStrategy } from "./custom_leap_year";

const buildRetailCalendarFactory = memoize(
  (retailCalendarOptions: RetailCalendarOptions, year: number) =>
    new RetailCalendarFactory(retailCalendarOptions, year),
  (retailCalendarOptions: RetailCalendarOptions, year: number) =>
    createMemoizationKeyFromCalendarOptionsAndYear(retailCalendarOptions, year)
);

export const RetailCalendarFactory: RetailCalendarConstructor = class Calendar
  implements RetailCalendar {
  year: number;
  calendarYear: number;
  numberOfWeeks: number;
  months: RetailCalendarMonth[];
  weeks: RetailCalendarWeek[];
  days: RetailCalendarDay[];
  options: RetailCalendarOptions;
  lastDayOfYear: Date;
  firstDayOfYear: Date;
  addLeapWeekToMonth: number;

  constructor(calendarOptions: RetailCalendarOptions, year: number) {
    this.year = year;
    this.options = calendarOptions;
    this.calendarYear = this.getAdjustedGregorianYear(year);
    this.addLeapWeekToMonth = this.options.addLeapWeekToMonth ?? -1;
    this.numberOfWeeks = this.calculateNumberOfWeeks();
    this.lastDayOfYear = this.calculateLastDayOfYear(
      this.calendarYear,
      this.year
    );
    this.firstDayOfYear = startOfDay(
      addDaysToDate(addWeeksToDate(this.lastDayOfYear, -this.numberOfWeeks), 1)
    );
    this.weeks = this.generateWeeks();
    this.months = this.generateMonths();
    this.days = this.generateDays();
  }

  static getRetailCalendar(
    retailCalendarOptions: RetailCalendarOptions,
    year: number
  ) {
    return buildRetailCalendarFactory(retailCalendarOptions, year);
  }

  static getWeekOfYear(result: RetailCalendar, weekOfYear: number): RetailCalendarWeek {
    return result.weeks.find((week) => week.weekOfYear === weekOfYear) as RetailCalendarWeek;
  }

  static getMonthOfYear(result: RetailCalendar, monthOfYear: number): RetailCalendarMonth {
    return result.months.find((month) => month.monthOfYear === monthOfYear) as RetailCalendarMonth;
  }

  static getDateOfYear(result: RetailCalendar, dayOfYear: number): RetailCalendarDay {
    return result.days.find((day) => day.dayOfYear === dayOfYear) as RetailCalendarDay;
  }

  static getWeekAndMonth(retailCalendarOptions: RetailCalendarOptions, date: Date) {
    let calendarData: RetailCalendar = this.getRetailCalendar(retailCalendarOptions, date.getFullYear())
    let currentDay = getDayDifference(date, new Date(calendarData.firstDayOfYear))+1;
    let currentDayData:RetailCalendarDay  = this.getDateOfYear(calendarData, currentDay);
    if (currentDayData) {
      return {
        weekOfYear: this.getWeekOfYear(calendarData, currentDayData.weekOfYear),
        monthOfYear: this.getMonthOfYear(calendarData, currentDayData.monthOfYear),
        date: currentDayData.gregorianStartDate,
      };
    } else {
      if(currentDay < 0 ) {
        calendarData = this.getRetailCalendar(retailCalendarOptions, date.getFullYear()-1)
        currentDay = getDayDifference(date, new Date(calendarData.firstDayOfYear))+1;
      }else if(currentDay > 364) {
        calendarData = this.getRetailCalendar(retailCalendarOptions, date.getFullYear()+1)
        currentDay = getDayDifference(date, new Date(calendarData.firstDayOfYear))+1;
      } 
      currentDayData = this.getDateOfYear(calendarData, currentDay);
      return {
        weekOfYear: this.getWeekOfYear(calendarData, currentDayData.weekOfYear),
        monthOfYear: this.getMonthOfYear(calendarData, currentDayData.monthOfYear),
        date: currentDayData.gregorianStartDate,
      };
    }
  }

  static getRetailMonth(
    retailCalendarOptions: RetailCalendarOptions,
    date: Date
  ): RetailMonth {
    const result = this.getWeekAndMonth(retailCalendarOptions, date);
    if (!result) {
      throw new Error(
        `No retail calendar month found for ${date.toDateString()}. This should never be the case. Please report this to calendar authorities.`
      );
    }
    return {
      month: result.monthOfYear,
      week: result.weekOfYear,
      date: result.date
    };
  }

  generateMonths(): RetailCalendarMonth[] {
    const months = [];
    const beginningIndex = this.getBeginningOfMonthIndex();
    let index = beginningIndex;

    for (const numberOfWeeks of this.getWeekDistribution()) {
      const quarterOfYear = Math.floor((index - beginningIndex) / 3) + 1;
      if (this.options.weekGrouping === WeekGrouping.GroupRegular) {
        const jan1 = new Date(this.calendarYear, 0, 1);
        const week0Start = new Date(this.weeks[0].gregorianStartDate);
        const week0End = new Date(this.weeks[0].gregorianEndDate);

        if (jan1 < week0Start || jan1 > week0End) {
          // Create previous week
          const prevWeekEnd = new Date(week0Start);
          prevWeekEnd.setDate(prevWeekEnd.getDate() - 1);
          const prevWeekStart = new Date(prevWeekEnd);
          prevWeekStart.setDate(prevWeekStart.getDate() - 6);

          // Create new week object for previous week
          const prevWeek = new CalendarWeek(
            0, // weekOfYear
            0, // weekOfMonth
            0, // weekOfQuarter
            1, // monthOfYear
            1, // quarterOfYear
            prevWeekStart,
            prevWeekEnd
          );

          // Shift existing weeks indices
          this.weeks = this.weeks.map((week) => ({
            ...week,
            weekOfYear: week.weekOfYear + 1,
            weekOfMonth:
              week.monthOfYear === 1 ? week.weekOfMonth + 1 : week.weekOfMonth,
          }));

          // Insert previous week at the beginning
          this.weeks.unshift(prevWeek);
        }
      }
      const weeksOfMonth =
        this.options.weekGrouping === WeekGrouping.GroupRegular
          ? this.weeks.filter((week) => {
            const weekStart = new Date(week.gregorianStartDate);
            const weekEnd = new Date(week.gregorianEndDate);
            const calendarMonthStart = new Date(
              this.calendarYear,
              index - beginningIndex,
              1
            );
            const calendarMonthEnd = new Date(
              this.calendarYear,
              index - beginningIndex + 1,
              0
            );

            // For December, ensure we don't include weeks from previous year's December
            if (
              index - beginningIndex === 11 &&
              weekStart.getFullYear() < this.calendarYear
            ) {
              return false;
            }

            // For January, ensure we don't include weeks from next year
            if (
              index - beginningIndex === 0 &&
              weekStart.getFullYear() > this.calendarYear
            ) {
              return false;
            }

            // Include week if:
            // 1. Week starts in this month, OR
            // 2. Week contains the first day of this month
            // 3. Week contains the last day of this month
            return (
              weekStart.getMonth() === index - beginningIndex ||
              (weekStart <= calendarMonthStart &&
                weekEnd >= calendarMonthStart) ||
              (weekStart <= calendarMonthEnd && weekEnd >= calendarMonthEnd)
            );
          })
          : this.weeks.filter((week) => week.monthOfYear === index);

      // Skip months with no weeks
      if (weeksOfMonth.length === 0) {
        index += 1;
        continue;
      }

      const monthStart = new Date(weeksOfMonth[0].gregorianStartDate);
      const monthEnd = new Date(
        weeksOfMonth[weeksOfMonth.length - 1].gregorianEndDate
      );
      months.push(
        new CalendarMonth(
          index,
          quarterOfYear,
          numberOfWeeks,
          weeksOfMonth,
          monthStart,
          monthEnd
        )
      );
      index += 1;
    }

    return months;
  }

  generateWeeks(): RetailCalendarWeek[] {
    const weeks = [];
    let extraWeek = 0;
    if (this.options.weekGrouping === WeekGrouping.GroupRegular) extraWeek = 1;
    for (let index = 0; index < this.numberOfWeeks + extraWeek; index++) {
      const weekIndex = index;
      const [monthOfYear, weekOfMonth, weekOfQuarter, quarterOfYear] =
        this.getMonthAndWeekOfMonthOfWeek(weekIndex);
      const start = addWeeksToDate(this.firstDayOfYear, index);
      const end = endOfDay(addDaysToDate(addWeeksToDate(start, 1), -1));
      weeks.push(
        new CalendarWeek(
          weekIndex,
          weekOfMonth,
          weekOfQuarter,
          monthOfYear,
          quarterOfYear,
          start,
          end
        )
      );
    }
    return weeks;
  }

  generateDays(): RetailCalendarDay[] {
    const days: RetailCalendarDay[] = [];
    const DAYS_IN_WEEK = 7;
    let dayOfYear = 1;
    this.weeks.forEach((week) => {
      for (let dayIndex = 1; dayIndex < DAYS_IN_WEEK + 1; dayIndex++) {
        const gregorianStartDate = addDaysToDate(
          week.gregorianStartDate,
          dayIndex - 1
        );
        const gregorianEndDate = endOfDay(gregorianStartDate);
        const gregorianMonthOfYear = gregorianStartDate.getMonth() + 1; // JS Date is 0 indexed
        const gregorianDayOfYear = getDayOfYear(gregorianStartDate);
        const gregorianDayOfMonth = gregorianStartDate.getDate();

        const isLeapWeek = this.isLeapWeek(week.weekOfYear);
        days.push({
          dayOfYear,
          dayOfWeek: dayIndex,
          dayOfMonth: isLeapWeek ? -1 : week.weekOfMonth * 7 + dayIndex,
          weekOfYear: week.weekOfYear,
          monthOfYear: isLeapWeek ? -1 : week.monthOfYear,
          gregorianStartDate,
          gregorianEndDate,
          gregorianMonthOfYear,
          gregorianDayOfYear,
          gregorianDayOfMonth,
        });
        dayOfYear += 1;
      }
    });
    return days;
  }

  isLeapWeek(weekIndex: number): boolean {
    if (weekIndex !== 52) {
      return false;
    }

    // If addLeapWeekToMonth is greater than zero, then that month has one additional week.
    // As a result, the 52nd week is not a leap week.
    return this.addLeapWeekToMonth === -1;
  }

  getMonthAndWeekOfMonthOfWeek(
    weekIndex: number
  ): [number, number, number, number] {
    const weekDistribution = this.getWeekDistribution();
    const monthOffset = this.getBeginningOfMonthIndex();

    let weekCount = 0;
    let monthOfYear = 0;
    let weekInQuarter = 0;
    let quarterOfYear = 0;

    for (let monthIndex = 0; monthIndex < 12; monthIndex++) {
      const weeksInMonth = weekDistribution[monthIndex];
      monthOfYear = monthIndex + monthOffset;

      if (monthIndex % 3 === 0) {
        weekInQuarter = 0;
        quarterOfYear = Math.floor(monthIndex / 3) + 1;
      }

      for (let weekInMonth = 0; weekInMonth < weeksInMonth; weekInMonth++) {
        if (weekIndex === weekCount) {
          return [monthOfYear, weekInMonth, weekInQuarter, quarterOfYear];
        }

        weekCount++;
        weekInQuarter++;
      }
    }

    return [-1, -1, -1, -1];
  }

  getBeginningOfMonthIndex(): number {
    const optionsIndex = this.options.beginningMonthIndex;
    if (optionsIndex !== undefined && optionsIndex !== null) {
      return optionsIndex;
    } else {
      return 1;
    }
  }

  getWeekDistribution(): number[] {
    let weekDistribution: number[];
    const firstDay = startOfDay(this.firstDayOfYear);
    switch (this.options.weekGrouping) {
      case WeekGrouping.Group445:
        weekDistribution = [4, 4, 5, 4, 4, 5, 4, 4, 5, 4, 4, 5];
        break;
      case WeekGrouping.Group454:
        weekDistribution = [4, 5, 4, 4, 5, 4, 4, 5, 4, 4, 5, 4];
        break;
      case WeekGrouping.Group544:
        weekDistribution = [5, 4, 4, 5, 4, 4, 5, 4, 4, 5, 4, 4];
        break;
      case WeekGrouping.GroupRegular:
        // For regular calendar, assign weeks to months based on where the majority of days fall

        weekDistribution = Array(12).fill(0);

        // Iterate through each week and assign it to the month where most of its days belong
        for (let weekIndex = 0; weekIndex < this.numberOfWeeks; weekIndex++) {
          const weekStart = addWeeksToDate(firstDay, weekIndex);
          const weekEnd = endOfDay(addDaysToDate(weekStart, 6));

          // Count days in each month for this week
          const daysInMonth = Array(12).fill(0);
          let currentDay = weekStart;

          for (let dayIndex = 0; dayIndex < 7; dayIndex++) {
            const monthIndex = currentDay.getMonth();
            daysInMonth[monthIndex]++;
            currentDay = addDaysToDate(currentDay, 1);
          }

          // Assign week to month with most days
          let maxDays = 0;
          let assignedMonth = 0;
          daysInMonth.forEach((days, monthIndex) => {
            if (days > maxDays) {
              maxDays = days;
              assignedMonth = monthIndex;
            }
          });

          weekDistribution[assignedMonth]++;
        }
        break;
      default:
        throw new Error(
          `Unsupported week grouping: ${this.options.weekGrouping}`
        );
    }

    if (
      this.options.addLeapWeekToMonth !== undefined &&
      this.options.addLeapWeekToMonth >= 0 &&
      this.numberOfWeeks === 53 &&
      this.options.weekGrouping !== WeekGrouping.GroupRegular // Skip for GroupRegular as it's handled above
    )
      weekDistribution[this.options.addLeapWeekToMonth]++;

    return weekDistribution;
  }

  calculateLastDayOfYear(year: number, retailCalendarYear: number): Date {
    const firstDayOfLastMonthOfYear = newSafeDate();
    firstDayOfLastMonthOfYear.setFullYear(year);
    this.options.lastMonthOfYear =
      this.options.weekGrouping === WeekGrouping.GroupRegular
        ? LastMonthOfYear.December
        : this.options.lastMonthOfYear;
    firstDayOfLastMonthOfYear.setMonth(this.options.lastMonthOfYear, 1);

    const lastDayOfYear = endOfMonth(firstDayOfLastMonthOfYear);
    const lastIsoWeekDay = this.options.lastDayOfWeek;
    this.options.weekCalculation =
      this.options.weekGrouping === WeekGrouping.GroupRegular
        ? WeekCalculation.LastDayNearestEOM
        : this.options.weekCalculation;
    const weekCalculation = this.getWeekCalculationStrategy(
      this.options.weekCalculation
    );
    return weekCalculation.getLastDayForGregorianLastDay(
      lastDayOfYear,
      lastIsoWeekDay,
      retailCalendarYear
    );
  }

  calculateNumberOfWeeks(): number {
    // Make sure we get whole day difference
    // by measuring from the end of current year to start of last year
    const lastDayOfYear = endOfDay(
      this.calculateLastDayOfYear(this.calendarYear, this.year)
    );
    const lastDayOfLastYear = startOfDay(
      this.calculateLastDayOfYear(this.calendarYear - 1, this.year - 1)
    );
    const numWeeks = getWeekDifference(lastDayOfYear, lastDayOfLastYear);
    return numWeeks;
  }

  getWeekCalculationStrategy(
    weekCalculation: WeekCalculation
  ): LastDayStrategy {
    switch (weekCalculation) {
      case WeekCalculation.LastDayBeforeEOM:
        return new LastDayBeforeEOMStrategy();
      case WeekCalculation.LastDayBeforeEomExceptLeapYear:
        return new LastDayBeforeEOMExceptLeapYearStrategy();
      case WeekCalculation.LastDayNearestEOM:
        return new LastDayNearestEOMStrategy();
      case WeekCalculation.FirstBOWOfFirstMonth:
        return new FirstBOWOfFirstMonth();
      case WeekCalculation.PenultimateDayOfWeekNearestEOM:
        return new PenultimateDayOfWeekNearestEOMStrategy();
      case WeekCalculation.CustomLeapYear: {
        const { leapYear, leapYearEndDate, leapYearFrequency } = this.options;
        if (
          leapYear === undefined ||
          leapYearEndDate === undefined ||
          leapYearFrequency === undefined
        ) {
          throw new Error(
            "CustomLeapYear week calculation requires leapYear, leapYearEndDate, and leapYearFrequency to be defined"
          );
        }
        return new CustomLeapYearStrategy(
          leapYear,
          leapYearEndDate,
          leapYearFrequency
        );
      }
    }
  }

  getAdjustedGregorianYear(year: number): number {
    if (
      this.options.lastMonthOfYear !== LastMonthOfYear.December &&
      this.options.weekGrouping !== WeekGrouping.GroupRegular
    ) {
      return year + 1;
    } else {
      return year;
    }
  }
};
