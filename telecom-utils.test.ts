import "jest";
import { TelecomUtils, TelecomValidationError, TelecomStyle } from "./telecom-utils";
import { ErrorType } from "errors-framework";

describe("TelecomUtils", () => {
    describe("getCanonicalForm", () => {
        it("correctly formats input numbers as e.164", () => {
            expect(
                TelecomUtils.getCanonicalString("(541) 754-3010", 1)
            ).toEqual("+15417543010");
            expect(
                TelecomUtils.getCanonicalString("+1 (541) 754-3010")
            ).toEqual("+15417543010");
            expect(
                TelecomUtils.getCanonicalString("0 478 123 456", 61)
            ).toEqual("+61478123456");
            expect(
                TelecomUtils.getCanonicalString("+61 0 478 123 456")
            ).toEqual("+61478123456");

            expect(
                TelecomUtils.getCanonicalString("+1 (541) 754-3010", 1)
            ).toEqual("+15417543010");

            expect(TelecomUtils.getCanonicalString("+15417543010")).toEqual(
                "+15417543010"
            );

            expect(TelecomUtils.getCanonicalString("+61 478 123 456")).toEqual(
                "+61478123456"
            );

            expect(TelecomUtils.getCanonicalString("+61478123456")).toEqual(
                "+61478123456"
            );

            try {
                const canonicalNumber = TelecomUtils.getCanonicalString(
                    `+15417543${Math.floor(Math.random() * 1000)}`,
                    1
                );
                expect(canonicalNumber).not.toBeUndefined();
            } catch (e) {
                expect(e).toHaveProperty("type", ErrorType.rule);
            }
        });

        it("correctly formats input numbers with extension", () => {
            expect(
                TelecomUtils.getCanonicalString("0 410 618 006#1", 61)
            ).toEqual("+61410618006#1");

            expect(
                TelecomUtils.getCanonicalString("+61410618006#12")
            ).toEqual("+61410618006#12");

            expect(
                TelecomUtils.getCanonicalString("(541) 754-3010#1", 1)
            ).toEqual("+15417543010#1");

            expect(
                TelecomUtils.getCanonicalString("+1 (541) 754-3010#23")
            ).toEqual("+15417543010#23");

            expect(
                TelecomUtils.getCanonicalString("+1 (541) 754-3010 # 23")
            ).toEqual("+15417543010#23");

            expect(
                TelecomUtils.getCanonicalString("+1 (541) 754-3010# 023")
            ).toEqual("+15417543010#023");

            expect(
                TelecomUtils.getCanonicalString("+1 (541) 754-3010 ext. 123")
            ).toEqual("+15417543010#123");

            expect(
                TelecomUtils.getCanonicalString("+1 (541) 754-3010 X 123")
            ).toEqual("+15417543010#123");

        });

        it("throws an error for invalid extension delimiter", () => {
            expect(
                () => TelecomUtils.getCanonicalString("0 410 618 006.1", 61)
            ).toThrow();

            expect(
                () => TelecomUtils.getCanonicalString("+61410618006+12")
            ).toThrow();

            expect(
                () => TelecomUtils.getCanonicalString("(541) 754-3010*1", 1)
            ).toThrow();

            expect(
                () => TelecomUtils.getCanonicalString("+1 (541) 754-3010/23")
            ).toThrow();

            expect(
                () => TelecomUtils.getCanonicalString("+1 (541) 754-3010&23")
            ).toThrow();

            expect(
                () => TelecomUtils.getCanonicalString("+1 (541) 754-3010@1")
            ).toThrow();

        });

        it("throws an error for invalid extension", () => {
            expect(
                () => TelecomUtils.getCanonicalString("+1 (541) 754-3010#abc")
            ).toThrow();

            expect(
                () => TelecomUtils.getCanonicalString("+1 (541) 754-3010#office1")
            ).toThrow();

            expect(
                () => TelecomUtils.getCanonicalString("+1 (541) 754-3010 ext. help")
            ).toThrow();

            expect(
                () => TelecomUtils.getCanonicalString("+1 (541) 754-3010 X 192.168.0.1")
            ).toThrow();

            expect(
                () => TelecomUtils.getCanonicalString("+1 (541) 754-3010#192.168.0.1")
            ).toThrow();

        });

        it("correctly formats without telecom extension", () => {
            expect(
                TelecomUtils.getCanonicalString("+61410618006#12", 61, TelecomStyle.withoutExtension)
            ).toEqual("+61410618006");

            expect(
                TelecomUtils.getCanonicalString("0 410 618 006#1", 61, TelecomStyle.withoutExtension)
            ).toEqual("+61410618006");

            expect(
                TelecomUtils.getCanonicalString("+1 (541) 754-3010 ext. 123", 1, TelecomStyle.withoutExtension)
            ).toEqual("+15417543010");

            expect(
                TelecomUtils.getCanonicalString("+1 (541) 754-3010 X 123", 1, TelecomStyle.withoutExtension)
            ).toEqual("+15417543010");

            expect(
                TelecomUtils.getCanonicalString("+1 (541) 754-3010x123", 1, TelecomStyle.withoutExtension)
            ).toEqual("+15417543010");

        });


        it("prefers country code from raw number over country code param", () => {
            expect(
                TelecomUtils.getCanonicalString("+61 0 478 123 456", 1)
            ).toEqual("+61478123456");
        });

        it("allows extraction of country code", () => {
            const number = TelecomUtils.getCanonicalNumber(
                "+61 0 478 123 456",
                1
            );
            expect(number.getCountryCode()).toEqual(61);
        });

        it("allows extraction of number excluding any prefix numbers", () => {
            const number = TelecomUtils.getCanonicalNumber(
                "+61 0 478 123 456",
                1
            );
            expect(number.getNationalNumber()).toEqual(478123456);
        });

        describe("invalid input", () => {
            it("throws an error for invalid country code", () => {
                expect(() =>
                    TelecomUtils.getCanonicalString("0 478 123 456")
                ).toThrow();
            });

            it("throws an error for raw input is too long", () => {
                expect(() =>
                    TelecomUtils.getCanonicalString(
                        "123 123 123 123 123 123 123 123",
                        1
                    )
                ).toThrow();
            });

            it("throws an error malformed raw input", () => {
                expect(() =>
                    TelecomUtils.getCanonicalString("invalid 123 456", 1)
                ).toThrowError(TelecomValidationError);
            });

            it("IsValidNumber works", () => {
                let isValid = TelecomUtils.isValidNumber("invalid 123 456", 1);
                expect(isValid).toBeFalsy();

                isValid = TelecomUtils.isValidNumber("+61 (0) 478 123 456");
                expect(isValid).toBeTruthy();

                isValid = TelecomUtils.isValidNumber("+610478123456");
                expect(isValid).toBeTruthy();

                isValid = TelecomUtils.isValidNumber("+61478 123 456");
                expect(isValid).toBeTruthy();

                // Numbers with Extensions - 7 digit and no space
                isValid = TelecomUtils.isValidNumber("+61478123456#1234567");
                expect(isValid).toBeTruthy();

                isValid = TelecomUtils.isValidNumber("+61 (0) 478 123 456 # 1 234567");
                expect(isValid).toBeFalsy();

                isValid = TelecomUtils.isValidNumber("+61 (0) 478 123 456 # 1234567");
                expect(isValid).toBeFalsy();

                isValid = TelecomUtils.isValidNumber("+61 (0) 478 123 456 * 1234567");
                expect(isValid).toBeFalsy();

                isValid = TelecomUtils.isValidNumber("+61 (0) 478 123 456 + 1234567");
                expect(isValid).toBeFalsy();

            });

            it("isValidNumber validates incorrect numbers ", () => {
                let isValid = true;
                // Invalid start of numbers
                isValid = TelecomUtils.isValidNumber("++61 (0) 478 123 456");
                expect(isValid).toBeFalsy();
                isValid = TelecomUtils.isValidNumber("+++61 (0) 478 123 456");
                expect(isValid).toBeFalsy();
                isValid = TelecomUtils.isValidNumber("*+61 (0) 478 123 456");
                expect(isValid).toBeFalsy();
                isValid = TelecomUtils.isValidNumber("**+61 (0) 478 123 456");
                expect(isValid).toBeFalsy();

                // invalid ending numbers
                isValid = TelecomUtils.isValidNumber("+61 (0) 478 123 456*");
                expect(isValid).toBeFalsy();
                isValid = TelecomUtils.isValidNumber("+61 (0) 478 123 456+");
                expect(isValid).toBeFalsy();
                isValid = TelecomUtils.isValidNumber("+61 (0) 478 123 456#");
                expect(isValid).toBeFalsy();

                isValid = TelecomUtils.isValidNumber("+61 (0) 478 123 456 *");
                expect(isValid).toBeFalsy();
                isValid = TelecomUtils.isValidNumber("+61 (0) 478 123 456 +");
                expect(isValid).toBeFalsy();
                // Fails to parse
                isValid = TelecomUtils.isValidNumber("+61 (0) 478 123 456 #");
                expect(isValid).toBeFalsy();
                isValid = TelecomUtils.isValidNumber("+61449766542#");
                expect(isValid).toBeFalsy();
                isValid = TelecomUtils.isValidNumber("+610449766542#");
                expect(isValid).toBeFalsy();

                // invalid character in between
                isValid = TelecomUtils.isValidNumber("+61 *(0) 478 123 456");
                expect(isValid).toBeFalsy();
                isValid = TelecomUtils.isValidNumber("+61 ***(0) 478 123 456");
                expect(isValid).toBeFalsy();
                isValid = TelecomUtils.isValidNumber("+61 (0) 478# 123456");
                expect(isValid).toBeFalsy();
                isValid = TelecomUtils.isValidNumber("+61 *(0) 478# 123456");
                expect(isValid).toBeFalsy();
                isValid = TelecomUtils.isValidNumber("+61 (0) 478#123456");
                expect(isValid).toBeFalsy();
                isValid = TelecomUtils.isValidNumber("+61 *(0) 478#123456");
                expect(isValid).toBeFalsy();
                // Fails to parse
                isValid = TelecomUtils.isValidNumber("+61 (0) 478 # 123456");
                expect(isValid).toBeFalsy();
                isValid = TelecomUtils.isValidNumber("+61 *(0) 478 # 123456");
                expect(isValid).toBeFalsy();
            })
        });
    });

    describe("Comparison utility", () => {
        it("performs comparision between two given telcom numbers", () => {
            expect(
                TelecomUtils.isSame("+61400100200", "+61 400100200")
            ).toBeTruthy();
            expect(
                TelecomUtils.isSame("+61400100200", "+61 400 100 200")
            ).toBeTruthy();
            expect(
                TelecomUtils.isSame("+61400100200", "+61400100300")
            ).toBeFalsy();
        });
    });

    describe("AsYouTypeFormatter", () => {
        it("Cell number formatting", () => {

            let telecom = "+17";
            let formattedNumberForUS = "+1 7";
            expect(TelecomUtils.asYouTypeFormatter(telecom, "US")).toBe(formattedNumberForUS);

            telecom = "+1 7";
            formattedNumberForUS = "+1 7";
            expect(TelecomUtils.asYouTypeFormatter(telecom, "US")).toBe(formattedNumberForUS);

            telecom = "+178";
            formattedNumberForUS = "+1 78";
            expect(TelecomUtils.asYouTypeFormatter(telecom, "US")).toBe(formattedNumberForUS);

            telecom = "+1 78";
            formattedNumberForUS = "+1 78";
            expect(TelecomUtils.asYouTypeFormatter(telecom, "US")).toBe(formattedNumberForUS);

            telecom = "+1787";
            formattedNumberForUS = "+1 787";
            expect(TelecomUtils.asYouTypeFormatter(telecom, "US")).toBe(formattedNumberForUS);

            telecom = "+1 787";
            formattedNumberForUS = "+1 787";
            expect(TelecomUtils.asYouTypeFormatter(telecom, "US")).toBe(formattedNumberForUS);

            telecom = "+17878";
            formattedNumberForUS = "+1 787-8";
            expect(TelecomUtils.asYouTypeFormatter(telecom, "US")).toBe(formattedNumberForUS);

            {
                // This fails
                telecom = "+1 7878";
                formattedNumberForUS = "+1 787-8";
                let isTelecomEqualsTOFormattedNumberForUS = (TelecomUtils.asYouTypeFormatter(telecom, "US") === formattedNumberForUS)
                expect(isTelecomEqualsTOFormattedNumberForUS).toBeFalsy();
            }

            telecom = "+17878787878";
            formattedNumberForUS = "+1 787-878-7878";
            expect(TelecomUtils.asYouTypeFormatter(telecom, "US")).toBe(formattedNumberForUS);

            telecom = "+1 (787) 878-7878";
            formattedNumberForUS = "+1 (787) 878-7878";
            expect(TelecomUtils.asYouTypeFormatter(telecom, "US")).toBe(formattedNumberForUS);

            // This fails
            telecom = "+1 (787)878-7878";
            formattedNumberForUS = "+1 (787) 878-7878";
            let isTelecomEqualsTOFormattedNumberForUS = (TelecomUtils.asYouTypeFormatter(telecom, "US") === formattedNumberForUS)
            expect(isTelecomEqualsTOFormattedNumberForUS).toBeFalsy();

            telecom = "+1 787-878";
            formattedNumberForUS = "+1 787-878";
            expect(TelecomUtils.asYouTypeFormatter(telecom, "US")).toBe(formattedNumberForUS);

            // TODO: Ask@Alon asYoGoFormatter doesn't support extension. What to do?
            // telecom = "+17878787878#1";
            // formattedNumberForUS = "+1 787-878-7878#1";
            // expect(TelecomUtils.asYouTypeFormatter(telecom, "US")).toBe(formattedNumberForUS);

        })

    })
});
