"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const google_libphonenumber_1 = require("google-libphonenumber");
const errors_framework_1 = require("errors-framework");
const phoneUtil = google_libphonenumber_1.PhoneNumberUtil.getInstance();
const TELECOM_EXTENSION_PREFIX = "#";
class TelecomValidationError extends errors_framework_1.RuleViolationError {
    constructor() {
        // NOTE: for security reasons we do NOT include the invalid phone number in error
        super("Invalid phone number format");
    }
}
exports.TelecomValidationError = TelecomValidationError;
var TelecomStyle;
(function (TelecomStyle) {
    TelecomStyle["withExtension"] = "withExtension";
    TelecomStyle["withoutExtension"] = "withoutExtension";
    TelecomStyle["national"] = "national";
})(TelecomStyle = exports.TelecomStyle || (exports.TelecomStyle = {}));
class TelecomUtils {
    static getCanonicalString(rawTelecom, countryCode, style = TelecomStyle.withExtension) {
        const parsedNumber = TelecomUtils.getCanonicalNumber(rawTelecom, countryCode);
        const parsedExtension = parsedNumber.getExtension();
        // return canonical form based on style enum
        switch (style) {
            case TelecomStyle.withoutExtension:
                return phoneUtil.format(parsedNumber, google_libphonenumber_1.PhoneNumberFormat.E164);
            case TelecomStyle.national:
                return phoneUtil.format(parsedNumber, google_libphonenumber_1.PhoneNumberFormat.NATIONAL);
            case TelecomStyle.withExtension:
            default:
                let canonicalString = phoneUtil.format(parsedNumber, google_libphonenumber_1.PhoneNumberFormat.E164);
                canonicalString += parsedExtension
                    ? `${TELECOM_EXTENSION_PREFIX}${parsedExtension}`
                    : "";
                return canonicalString;
        }
    }
    static getCanonicalNumber(rawTelecom, countryCode) {
        const regionCode = countryCode
            ? phoneUtil.getRegionCodeForCountryCode(countryCode)
            : undefined;
        const parsedNumber = phoneUtil.parse(rawTelecom, regionCode);
        if (!phoneUtil.isValidNumber(parsedNumber)) {
            throw new TelecomValidationError();
        }
        return parsedNumber;
    }
    static isValidNumber(rawTelecom, countryCode) {
        const regionCode = countryCode
            ? phoneUtil.getRegionCodeForCountryCode(countryCode)
            : undefined;
        try {
            const parsedNumber = phoneUtil.parse(rawTelecom, regionCode);
            return (TelecomUtils.numberValidationPattern.test(rawTelecom) &&
                phoneUtil.isValidNumber(parsedNumber));
        }
        catch (e) {
            return false;
        }
    }
    static isSame(telecom, telecomToCompareAgainst) {
        try {
            return (TelecomUtils.getCanonicalString(telecom) ===
                TelecomUtils.getCanonicalString(telecomToCompareAgainst));
        }
        catch (_a) {
            return false;
        }
    }
    static hasExtension(telecom) {
        const parsedPhoneNumber = TelecomUtils.getCanonicalNumber(telecom);
        return !!parsedPhoneNumber.getExtension();
    }
    static asYouTypeFormatter(telecom, regionForFormatter) {
        const formatter = new google_libphonenumber_1.AsYouTypeFormatter(regionForFormatter);
        let formattedNumber = '';
        for (var i = 0; i < telecom.length; ++i) {
            formattedNumber = formatter.inputDigit(telecom[i]);
        }
        return formattedNumber;
    }
    /**
     * Format given telecom in the national format.
     * @param telecom
     */
    static getCanonicalNationalString(telecom, countryCodeFallback) {
        let telecomCountryCode;
        try {
            telecomCountryCode = TelecomUtils.getCanonicalNumber(telecom).getCountryCode();
        }
        catch (_a) {
            telecomCountryCode = countryCodeFallback;
        }
        return TelecomUtils.getCanonicalString(telecom, telecomCountryCode, TelecomStyle.national);
    }
    static getTelecomWithoutExtension(telecom) {
        const telecomCountryCode = TelecomUtils.getCanonicalNumber(telecom).getCountryCode();
        return TelecomUtils.getCanonicalString(telecom, telecomCountryCode, TelecomStyle.withoutExtension);
    }
}
TelecomUtils.numberValidationPattern = /(^[+0][ ()-\d]*[)\d])+([#][ ]*[\d]+)*$/;
exports.TelecomUtils = TelecomUtils;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGVsZWNvbS11dGlscy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbInRlbGVjb20tdXRpbHMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSxpRUFBK0Y7QUFDL0YsdURBQXNEO0FBRXRELE1BQU0sU0FBUyxHQUFHLHVDQUFlLENBQUMsV0FBVyxFQUFFLENBQUM7QUFDaEQsTUFBTSx3QkFBd0IsR0FBRyxHQUFHLENBQUM7QUFFckMsTUFBYSxzQkFBdUIsU0FBUSxxQ0FBa0I7SUFDMUQ7UUFDSSxpRkFBaUY7UUFDakYsS0FBSyxDQUFDLDZCQUE2QixDQUFDLENBQUM7SUFDekMsQ0FBQztDQUNKO0FBTEQsd0RBS0M7QUFFRCxJQUFZLFlBSVg7QUFKRCxXQUFZLFlBQVk7SUFDcEIsK0NBQStCLENBQUE7SUFDL0IscURBQXFDLENBQUE7SUFDckMscUNBQXFCLENBQUE7QUFDekIsQ0FBQyxFQUpXLFlBQVksR0FBWixvQkFBWSxLQUFaLG9CQUFZLFFBSXZCO0FBRUQsTUFBYSxZQUFZO0lBR3JCLE1BQU0sQ0FBQyxrQkFBa0IsQ0FDckIsVUFBa0IsRUFDbEIsV0FBb0IsRUFDcEIsUUFBc0IsWUFBWSxDQUFDLGFBQWE7UUFFaEQsTUFBTSxZQUFZLEdBQUcsWUFBWSxDQUFDLGtCQUFrQixDQUNoRCxVQUFVLEVBQ1YsV0FBVyxDQUNkLENBQUM7UUFDRixNQUFNLGVBQWUsR0FBRyxZQUFZLENBQUMsWUFBWSxFQUFFLENBQUM7UUFFcEQsNENBQTRDO1FBQzVDLFFBQVEsS0FBSyxFQUFFO1lBQ1gsS0FBSyxZQUFZLENBQUMsZ0JBQWdCO2dCQUM5QixPQUFPLFNBQVMsQ0FBQyxNQUFNLENBQUMsWUFBWSxFQUFFLHlDQUFpQixDQUFDLElBQUksQ0FBQyxDQUFDO1lBRWxFLEtBQUssWUFBWSxDQUFDLFFBQVE7Z0JBQ3RCLE9BQU8sU0FBUyxDQUFDLE1BQU0sQ0FBQyxZQUFZLEVBQUUseUNBQWlCLENBQUMsUUFBUSxDQUFDLENBQUM7WUFFdEUsS0FBSyxZQUFZ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