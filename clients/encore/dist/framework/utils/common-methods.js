"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommonMethods = void 0;
const otplib_1 = require("otplib");
const logger_1 = require("./logger");
class CommonMethods {
    constructor(_page) {
        logger_1.Log.info('CommonMethods constructor');
    }
    static initProp() {
        const baseUrl = process.env.BASE_URL || '';
        const config = {
            browser: process.env.DEFAULT_BROWSER || 'chrome',
            url: baseUrl,
            base_url: baseUrl,
            home_url: process.env.HOME_URL || '',
            username_automation: process.env.NAVIGATOR_USERNAME || process.env.USERNAME_AUTOMATION || 'test_user',
            password_automation: process.env.NAVIGATOR_PASSWORD || process.env.PASSWORD_AUTOMATION || 'test_password',
            mfa_secret: process.env.NAVIGATOR_MFA_SECRET || process.env.MFA_SECRET,
        };
        return config;
    }
    static generateTotpCode(secret) {
        try {
            const code = otplib_1.authenticator.generate(secret);
            logger_1.Log.info(`Generated TOTP code: ${code}`);
            return code;
        }
        catch (error) {
            logger_1.Log.error(`Error generating TOTP code: ${error}`);
            throw error;
        }
    }
}
exports.CommonMethods = CommonMethods;
