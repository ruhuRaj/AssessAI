"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
// Must run before any module reads process.env (e.g. emailService)
dotenv_1.default.config({ path: path_1.default.resolve(process.cwd(), '.env') });
//# sourceMappingURL=loadEnv.js.map