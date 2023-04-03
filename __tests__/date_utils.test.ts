import { addDaysToDate } from "../src/date_utils";

describe("date utils", () => {
    describe("addDaysToDate", () => {
        describe("when current day is March 29", () => {
            beforeEach(() => {
                jest.useFakeTimers().setSystemTime(new Date(2023, 2, 29));
            });
            it("should add 1 day to March 29", () => {
                const date = addDaysToDate(new Date(2023, 2, 29), 1);
                expect(date).toEqual(new Date(2023, 2, 30));
            });

            it("should add 2 days to March 29", () => {
                const date = addDaysToDate(new Date(2023, 2, 29), 2);
                expect(date).toEqual(new Date(2023, 2, 31));
            });

            it("should add 3 days to March 29", () => {
                const date = addDaysToDate(new Date(2023, 2, 29), 3);
                expect(date).toEqual(new Date(2023, 3, 1));
            });

            it("should subtract 29 days from March 29", () => {
                const date = addDaysToDate(new Date(2023, 2, 29), -29);
                expect(date).toEqual(new Date(2023, 1, 28));
            });

            it("should subtract 30 days from March 29", () => {
                const date = addDaysToDate(new Date(2023, 2, 29), -30);
                expect(date).toEqual(new Date(2023, 1, 27));
            });

            afterEach(() => {
                jest.useRealTimers();
            });
        });
    });
});