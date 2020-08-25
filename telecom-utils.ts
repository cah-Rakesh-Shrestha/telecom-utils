import { PhoneNumberUtil, PhoneNumberFormat, AsYouTypeFormatter } from "google-libphonenumber";
import { RuleViolationError } from "errors-framework";

const phoneUtil = PhoneNumberUtil.getInstance();
const TELECOM_EXTENSION_PREFIX = "#";

export class TelecomValidationError extends RuleViolationError {
    constructor() {
        // NOTE: for security reasons we do NOT include the invalid phone number in error
        super("Invalid phone number format");
    }
}

export enum TelecomStyle {
    withExtension = "withExtension",
    withoutExtension = "withoutExtension",
    national = "national",
}

export class TelecomUtils {
    static numberValidationPattern = /(^[+0][ ()-\d]*[)\d])+([#][ ]*[\d]+)*$/

    static getCanonicalString(
        rawTelecom: string,
        countryCode?: number,
        style: TelecomStyle = TelecomStyle.withExtension
    ): string {
        const parsedNumber = TelecomUtils.getCanonicalNumber(
            rawTelecom,
            countryCode
        );
        const parsedExtension = parsedNumber.getExtension();

        // return canonical form based on style enum
        switch (style) {
            case TelecomStyle.withoutExtension:
                return phoneUtil.format(parsedNumber, PhoneNumberFormat.E164);

            case TelecomStyle.national:
                return phoneUtil.format(parsedNumber, PhoneNumberFormat.NATIONAL);

            case TelecomStyle.withExtension:
            default:
                let canonicalString = phoneUtil.format(
                    parsedNumber,
                    PhoneNumberFormat.E164
                );
                canonicalString += parsedExtension
                    ? `${TELECOM_EXTENSION_PREFIX}${parsedExtension}`
                    : "";
                return canonicalString;
        }
    }

    static getCanonicalNumber(
        rawTelecom: string,
        countryCode?: number
    ): libphonenumber.PhoneNumber {
        const regionCode = countryCode
            ? phoneUtil.getRegionCodeForCountryCode(countryCode)
            : undefined;
        const parsedNumber = phoneUtil.parse(rawTelecom, regionCode);
        if (!phoneUtil.isValidNumber(parsedNumber)) {
            throw new TelecomValidationError();
        }
        return parsedNumber;
    }

    static isValidNumber(rawTelecom: string, countryCode?: number): boolean {
        const regionCode = countryCode
            ? phoneUtil.getRegionCodeForCountryCode(countryCode)
            : undefined;
        try {
            const parsedNumber = phoneUtil.parse(rawTelecom, regionCode);
            return (
                TelecomUtils.numberValidationPattern.test(rawTelecom) &&
                phoneUtil.isValidNumber(parsedNumber)
            );
        } catch (e) {
            return false;
        }
    }

    static isSame(telecom: string, telecomToCompareAgainst: string): boolean {
        try {
            return (
                TelecomUtils.getCanonicalString(telecom) ===
                TelecomUtils.getCanonicalString(telecomToCompareAgainst)
            );
        } catch {
            return false;
        }
    }

    static hasExtension(telecom: string): boolean {
        const parsedPhoneNumber = TelecomUtils.getCanonicalNumber(telecom);
        return !!parsedPhoneNumber.getExtension();
    }

    static asYouTypeFormatter(telecom: string, regionForFormatter: string): string {
        const formatter = new AsYouTypeFormatter(regionForFormatter);
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
    static getCanonicalNationalString(telecom: string, countryCodeFallback: number): string {
        let telecomCountryCode: number | undefined;
        try {
            telecomCountryCode = TelecomUtils.getCanonicalNumber(telecom).getCountryCode();
        } catch {
            telecomCountryCode = countryCodeFallback
        }
        return TelecomUtils.getCanonicalString(
            telecom,
            telecomCountryCode,
            TelecomStyle.national

        )
    }

    static getTelecomWithoutExtension(telecom: string) {
        const telecomCountryCode = TelecomUtils.getCanonicalNumber(
            telecom
        ).getCountryCode();

        return TelecomUtils.getCanonicalString(
            telecom,
            telecomCountryCode,
            TelecomStyle.withoutExtension
        )
    }
}
