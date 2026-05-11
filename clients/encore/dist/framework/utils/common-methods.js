"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommonMethods = void 0;
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
        };
        return config;
    }
}
exports.CommonMethods = CommonMethods;
