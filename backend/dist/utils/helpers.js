"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.capitalizeWords = exports.parseMarkString = exports.validateEmail = exports.AppError = exports.delay = exports.generateId = void 0;
const uuid_1 = require("uuid");
const generateId = () => (0, uuid_1.v4)();
exports.generateId = generateId;
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
exports.delay = delay;
class AppError extends Error {
    constructor(statusCode, message, details) {
        super(message);
        this.statusCode = statusCode;
        this.message = message;
        this.details = details;
    }
}
exports.AppError = AppError;
const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
};
exports.validateEmail = validateEmail;
const parseMarkString = (marks) => {
    const num = parseInt(String(marks), 10);
    return isNaN(num) || num < 0 ? 0 : num;
};
exports.parseMarkString = parseMarkString;
const capitalizeWords = (str) => {
    return str
        .split(' ')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');
};
exports.capitalizeWords = capitalizeWords;
//# sourceMappingURL=helpers.js.map