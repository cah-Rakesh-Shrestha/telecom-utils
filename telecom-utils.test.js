"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("jest");
const telecom_utils_1 = require("./telecom-utils");
const errors_framework_1 = require("errors-framework");
describe("TelecomUtils", () => {
    describe("getCanonicalForm", () => {
        it("correctly formats input numbers as e.164", () => {
            expect(telecom_utils_1.TelecomUtils.getCanonicalString("(541) 754-3010", 1)).toEqual("+15417543010");
            expect(telecom_utils_1.TelecomUtils.getCanonicalString("+1 (541) 754-3010")).toEqual("+15417543010");
            expect(telecom_utils_1.TelecomUtils.getCanonicalString("0 478 123 456", 61)).toEqual("+61478123456");
            expect(telecom_utils_1.TelecomUtils.getCanonicalString("+61 0 478 123 456")).toEqual("+61478123456");
            expect(telecom_utils_1.TelecomUtils.getCanonicalString("+1 (541) 754-3010", 1)).toEqual("+15417543010");
            expect(telecom_utils_1.TelecomUtils.getCanonicalString("+15417543010")).toEqual("+15417543010");
            expect(telecom_utils_1.TelecomUtils.getCanonicalString("+61 478 123 456")).toEqual("+61478123456");
            expect(telecom_utils_1.TelecomUtils.getCanonicalString("+61478123456")).toEqual("+61478123456");
            try {
                const canonicalNumber = telecom_utils_1.TelecomUtils.getCanonicalString(`+15417543${Math.floor(Math.random() * 1000)}`, 1);
                expect(canonicalNumber).not.toBeUndefined();
            }
            catch (e) {
                expect(e).toHaveProperty("type", errors_framework_1.ErrorType.rule);
            }
        });
        it("correctly formats input numbers with extension", () => {
            expect(telecom_utils_1.TelecomUtils.getCanonicalString("0 410 618 006#1", 61)).toEqual("+61410618006#1");
            expect(telecom_utils_1.TelecomUtils.getCanonicalString("+61410618006#12")).toEqual("+61410618006#12");
            expect(telecom_utils_1.TelecomUtils.getCanonicalString("(541) 754-3010#1", 1)).toEqual("+15417543010#1");
            expect(telecom_utils_1.TelecomUtils.getCanonicalString("+1 (541) 754-3010#23")).toEqual("+15417543010#23");
            expect(telecom_utils_1.TelecomUtils.getCanonicalString("+1 (541) 754-3010 # 23")).toEqual("+15417543010#23");
            expect(telecom_utils_1.TelecomUtils.getCanonicalString("+1 (541) 754-3010# 023")).toEqual("+15417543010#023");
            expect(telecom_utils_1.TelecomUtils.getCanonicalString("+1 (541) 754-3010 ext. 123")).toEqual("+15417543010#123");
            expect(telecom_utils_1.TelecomUtils.getCanonicalString("+1 (541) 754-3010 X 123")).toEqual("+15417543010#123");
        });
        it("throws an error for invalid extension delimiter", () => {
            expect(() => telecom_utils_1.TelecomUtils.getCanonicalString("0 410 618 006.1", 61)).toThrow();
            expect(() => telecom_utils_1.TelecomUtils.getCanonicalString("+61410618006+12")).toThrow();
            expect(() => telecom_utils_1.TelecomUtils.getCanonicalString("(541) 754-3010*1", 1)).toThrow();
            expect(() => telecom_utils_1.TelecomUtils.getCanonicalString("+1 (541) 754-3010/23")).toThrow();
            expect(() => telecom_utils_1.TelecomUtils.getCanonicalString("+1 (541) 754-3010&23")).toThrow();
            expect(() => telecom_utils_1.TelecomUtils.getCanonicalString("+1 (541) 754-3010@1")).toThrow();
        });
        it("throws an error for invalid extension", () => {
            expect(() => telecom_utils_1.TelecomUtils.getCanonicalString("+1 (541) 754-3010#abc")).toThrow();
            expect(() => telecom_utils_1.TelecomUtils.getCanonicalString("+1 (541) 754-3010#office1")).toThrow();
            expect(() => telecom_utils_1.TelecomUtils.getCanonicalString("+1 (541) 754-3010 ext. help")).toThrow();
            expect(() => telecom_utils_1.TelecomUtils.getCanonicalString("+1 (541) 754-3010 X 192.168.0.1")).toThrow();
            expect(() => telecom_utils_1.TelecomUtils.getCanonicalString("+1 (541) 754-3010#192.168.0.1")).toThrow();
        });
        it("correctly formats without telecom extension", () => {
            expect(telecom_utils_1.TelecomUtils.getCanonicalString("+61410618006#12", 61, telecom_utils_1.TelecomStyle.withoutExtension)).toEqual("+61410618006");
            expect(telecom_utils_1.TelecomUtils.getCanonicalString("0 410 618 006#1", 61, telecom_utils_1.TelecomStyle.withoutExtension)).toEqual("+61410618006");
            expect(telecom_utils_1.TelecomUtils.getCanonicalString("+1 (541) 754-3010 ext. 123", 1, telecom_utils_1.TelecomStyle.withoutExtension)).toEqual("+15417543010");
            expect(telecom_utils_1.TelecomUtils.getCanonicalString("+1 (541) 754-3010 X 123", 1, telecom_utils_1.TelecomStyle.withoutExtension)).toEqual("+15417543010");
            expect(telecom_utils_1.TelecomUtils.getCanonicalString("+1 (541) 754-3010x123", 1, telecom_utils_1.TelecomStyle.withoutExtension)).toEqual("+15417543010");
        });
        it("prefers country code from raw number over country code param", () => {
            expect(telecom_utils_1.TelecomUtils.getCanonicalString("+61 0 478 123 456", 1)).toEqual("+61478123456");
        });
        it("allows extraction of country code", () => {
            const number = telecom_utils_1.TelecomUtils.getCanonicalNumber("+61 0 478 123 456", 1);
            expect(number.getCountryCode()).toEqual(61);
        });
        it("allows extraction of number excluding any prefix numbers", () => {
            const number = telecom_utils_1.TelecomUtils.getCanonicalNumber("+61 0 478 123 456", 1);
            expect(number.getNationalNumber()).toEqual(478123456);
        });
        describe("invalid input", () => {
            it("throws an error for invalid country code", () => {
                expect(() => telecom_utils_1.TelecomUtils.getCanonicalString("0 478 123 456")).toThrow();
            });
            it("throws an error for raw input is too long", () => {
                expect(() => telecom_utils_1.TelecomUtils.getCanonicalString("123 123 123 123 123 123 123 123", 1)).toThrow();
            });
            it("throws an error malformed raw input", () => {
                expect(() => telecom_utils_1.TelecomUtils.getCanonicalString("invalid 123 456", 1)).toThrowError(telecom_utils_1.TelecomValidationError);
            });
            it("IsValidNumber works", () => {
                let isValid = telecom_utils_1.TelecomUtils.isValidNumber("invalid 123 456", 1);
                expect(isValid).toBeFalsy();
                isValid = telecom_utils_1.TelecomUtils.isValidNumber("+61 (0) 478 123 456");
                expect(isValid).toBeTruthy();
                isValid = telecom_utils_1.TelecomUtils.isValidNumber("+610478123456");
                expect(isValid).toBeTruthy();
                isValid = telecom_utils_1.TelecomUtils.isValidNumber("+61478 123 456");
                expect(isValid).toBeTruthy();
                // Numbers with Extensions - 7 digit and no space
                isValid = telecom_utils_1.TelecomUtils.isValidNumber("+61478123456#1234567");
                expect(isValid).toBeTruthy();
                isValid = telecom_utils_1.TelecomUtils.isValidNumber("+61 (0) 478 123 456 # 1 234567");
                expect(isValid).toBeFalsy();
                isValid = telecom_utils_1.TelecomUtils.isValidNumber("+61 (0) 478 123 456 # 1234567");
                expect(isValid).toBeFalsy();
                isValid = telecom_utils_1.TelecomUtils.isValidNumber("+61 (0) 478 123 456 * 1234567");
                expect(isValid).toBeFalsy();
                isValid = telecom_utils_1.TelecomUtils.isValidNumber("+61 (0) 478 123 456 + 1234567");
                expect(isValid).toBeFalsy();
            });
            it("isValidNumber validates incorrect numbers ", () => {
                let isValid = true;
                // Invalid start of numbers
                isValid = telecom_utils_1.TelecomUtils.isValidNumber("++61 (0) 478 123 456");
                expect(isValid).toBeFalsy();
                isValid = telecom_utils_1.TelecomUtils.isValidNumber("+++61 (0) 478 123 456");
                expect(isValid).toBeFalsy();
                isValid = telecom_utils_1.TelecomUtils.isValidNumber("*+61 (0) 478 123 456");
                expect(isValid).toBeFalsy();
                isValid = telecom_utils_1.TelecomUtils.isValidNumber("**+61 (0) 478 123 456");
                expect(isValid).toBeFalsy();
                // invalid ending numbers
                isValid = telecom_utils_1.TelecomUtils.isValidNumber("+61 (0) 478 123 456*");
                expect(isValid).toBeFalsy();
                isValid = telecom_utils_1.TelecomUtils.isValidNumber("+61 (0) 478 123 456+");
                expect(isValid).toBeFalsy();
                isValid = telecom_utils_1.TelecomUtils.isValidNumber("+61 (0) 478 123 456#");
                expect(isValid).toBeFalsy();
                isValid = telecom_utils_1.TelecomUtils.isValidNumber("+61 (0) 478 123 456 *");
                expect(isValid).toBeFalsy();
                isValid = telecom_utils_1.TelecomUtils.isValidNumber("+61 (0) 478 123 456 +");
                expect(isValid).toBeFalsy();
                // Fails to parse
                isValid = telecom_utils_1.TelecomUtils.isValidNumber("+61 (0) 478 123 456 #");
                expect(isValid).toBeFalsy();
                isValid = telecom_utils_1.TelecomUtils.isValidNumber("+61449766542#");
                expect(isValid).toBeFalsy();
                isValid = telecom_utils_1.TelecomUtils.isValidNumber("+610449766542#");
                expect(isValid).toBeFalsy();
                // invalid character in between
                isValid = telecom_utils_1.TelecomUtils.isValidNumber("+61 *(0) 478 123 456");
                expect(isValid).toBeFalsy();
                isValid = telecom_utils_1.TelecomUtils.isValidNumber("+61 ***(0) 478 123 456");
                expect(isValid).toBeFalsy();
                isValid = telecom_utils_1.TelecomUtils.isValidNumber("+61 (0) 478# 123456");
                expect(isValid).toBeFalsy();
                isValid = telecom_utils_1.TelecomUtils.isValidNumber("+61 *(0) 478# 123456");
                expect(isValid).toBeFalsy();
                isValid = telecom_utils_1.TelecomUtils.isValidNumber("+61 (0) 478#123456");
                expect(isValid).toBeFalsy();
                isValid = telecom_utils_1.TelecomUtils.isValidNumber("+61 *(0) 478#123456");
                expect(isValid).toBeFalsy();
                // Fails to parse
                isValid = telecom_utils_1.TelecomUtils.isValidNumber("+61 (0) 478 # 123456");
                expect(isValid).toBeFalsy();
                isValid = telecom_utils_1.TelecomUtils.isValidNumber("+61 *(0) 478 # 123456");
                expect(isValid).toBeFalsy();
            });
        });
    });
    describe("Comparison utility", () => {
        it("performs comparision between two given telcom numbers", () => {
            expect(telecom_utils_1.TelecomUtils.isSame("+61400100200", "+61 400100200")).toBeTruthy();
            expect(telecom_utils_1.TelecomUtils.isSame("+61400100200", "+61 400 100 200")).toBeTruthy();
            expect(telecom_utils_1.TelecomUtils.isSame("+61400100200", "+61400100300")).toBeFalsy();
        });
    });
    describe("AsYouTypeFormatter", () => {
        it("Cell number formatting", () => {
            let telecom = "+17";
            let formattedNumberForUS = "+1 7";
            expect(telecom_utils_1.TelecomUtils.asYouTypeFormatter(telecom, "US")).toBe(formattedNumberForUS);
            telecom = "+1 7";
            formattedNumberForUS = "+1 7";
            expect(telecom_utils_1.TelecomUtils.asYouTypeFormatter(telecom, "US")).toBe(formattedNumberForUS);
            telecom = "+178";
            formattedNumberForUS = "+1 78";
            expect(telecom_utils_1.TelecomUtils.asYouTypeFormatter(telecom, "US")).toBe(formattedNumberForUS);
            telecom = "+1 78";
            formattedNumberForUS = "+1 78";
            expect(telecom_utils_1.TelecomUtils.asYouTypeFormatter(telecom, "US")).toBe(formattedNumberForUS);
            telecom = "+1787";
            formattedNumberForUS = "+1 787";
            expect(telecom_utils_1.TelecomUtils.asYouTypeFormatter(telecom, "US")).toBe(formattedNumberForUS);
            telecom = "+1 787";
            formattedNumberForUS = "+1 787";
            expect(telecom_utils_1.TelecomUtils.asYouTypeFormatter(telecom, "US")).toBe(formattedNumberForUS);
            telecom = "+17878";
            formattedNumberForUS = "+1 787-8";
            expect(telecom_utils_1.TelecomUtils.asYouTypeFormatter(telecom, "US")).toBe(formattedNumberForUS);
            {
                // This fails
                telecom = "+1 7878";
                formattedNumberForUS = "+1 787-8";
                let isTelecomEqualsTOFormattedNumberForUS = (telecom_utils_1.TelecomUtils.asYouTypeFormatter(telecom, "US") === formattedNumberForUS);
                expect(isTelecomEqualsTOFormattedNumberForUS).toBeFalsy();
            }
            telecom = "+17878787878";
            formattedNumberForUS = "+1 787-878-7878";
            expect(telecom_utils_1.TelecomUtils.asYouTypeFormatter(telecom, "US")).toBe(formattedNumberForUS);
            telecom = "+1 (787) 878-7878";
            formattedNumberForUS = "+1 (787) 878-7878";
            expect(telecom_utils_1.TelecomUtils.asYouTypeFormatter(telecom, "US")).toBe(formattedNumberForUS);
            // This fails
            telecom = "+1 (787)878-7878";
            formattedNumberForUS = "+1 (787) 878-7878";
            let isTelecomEqualsTOFormattedNumberForUS = (telecom_utils_1.TelecomUtils.asYouTypeFormatter(telecom, "US") === formattedNumberForUS);
            expect(isTelecomEqualsTOFormattedNumberForUS).toBeFalsy();
            telecom = "+1 787-878";
            formattedNumberForUS = "+1 787-878";
            expect(telecom_utils_1.TelecomUtils.asYouTypeFormatter(telecom, "US")).toBe(formattedNumberForUS);
            // TODO: Ask@Alon asYoGoFormatter doesn't support extension. What to do?
            // telecom = "+17878787878#1";
            // formattedNumberForUS = "+1 787-878-7878#1";
            // expect(TelecomUtils.asYouTypeFormatter(telecom, "US")).toBe(formattedNumberForUS);
        });
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGVsZWNvbS11dGlscy50ZXN0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsidGVsZWNvbS11dGlscy50ZXN0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsZ0JBQWM7QUFDZCxtREFBcUY7QUFDckYsdURBQTZDO0FBRTdDLFFBQVEsQ0FBQyxjQUFjLEVBQUUsR0FBRyxFQUFFO0lBQzFCLFFBQVEsQ0FBQyxrQkFBa0IsRUFBRSxHQUFHLEVBQUU7UUFDOUIsRUFBRSxDQUFDLDBDQUEwQyxFQUFFLEdBQUcsRUFBRTtZQUNoRCxNQUFNLENBQ0YsNEJBQVksQ0FBQyxrQkFBa0IsQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDLENBQUMsQ0FDdkQsQ0FBQyxPQUFPLENBQUMsY0FBYyxDQUFDLENBQUM7WUFDMUIsTUFBTSxDQUNGLDRCQUFZLENBQUMsa0JBQWtCLENBQUMsbUJBQW1CLENBQUMsQ0FDdkQsQ0FBQyxPQUFPLENBQUMsY0FBYyxDQUFDLENBQUM7WUFDMUIsTUFBTSxDQUNGLDRCQUFZLENBQUMsa0JBQWtCLENBQUMsZUFBZSxFQUFFLEVBQUUsQ0FBQyxDQUN2RCxDQUFDLE9BQU8sQ0FBQyxjQUFjLENBQUMsQ0FBQztZQUMxQixNQUFNLENBQ0YsNEJBQVksQ0FBQyxrQkFBa0IsQ0FBQyxtQkFBbUIsQ0FBQyxDQUN2RCxDQUFDLE9BQU8sQ0FBQyxjQUFjLENBQUMsQ0FBQztZQUUxQixNQUFNLENBQ0YsNEJBQVksQ0FBQyxrQkFBa0IsQ0FBQyxtQkFBbUIsRUFBRSxDQUFDLENBQUMsQ0FDMUQsQ0FBQyxPQUFPLENBQUMsY0FBYyxDQUFDLENBQUM7WUFFMUIsTUFBTSxDQUFDLDRCQUFZLENBQUMsa0JBQWtCLENBQUMsY0FBYyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQzNELGNBQWMsQ0FDakIsQ0FBQztZQUVGLE1BQU0sQ0FBQyw0QkFBWSxDQUFDLGtCQUFrQixDQUFDLGlCQUFpQixDQUFDLENBQUMsQ0FBQyxPQUFPLENBQzlELGNBQWMsQ0FDakIs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