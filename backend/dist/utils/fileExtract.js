"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.extractTextFromFile = extractTextFromFile;
exports.truncateReferenceContent = truncateReferenceContent;
const promises_1 = __importDefault(require("fs/promises"));
const path_1 = __importDefault(require("path"));
async function extractTextFromFile(filePath, originalName) {
    const ext = path_1.default.extname(originalName).toLowerCase();
    if (ext === '.txt') {
        return promises_1.default.readFile(filePath, 'utf-8');
    }
    if (ext === '.pdf') {
        try {
            const { PDFParse } = await Promise.resolve().then(() => __importStar(require('pdf-parse')));
            const buffer = await promises_1.default.readFile(filePath);
            const parser = new PDFParse({ data: buffer });
            const result = await parser.getText();
            await parser.destroy();
            return result.text?.trim() || '';
        }
        catch {
            return '';
        }
    }
    return '';
}
function truncateReferenceContent(text, maxLen = 8000) {
    const trimmed = text.replace(/\s+/g, ' ').trim();
    if (trimmed.length <= maxLen)
        return trimmed;
    return `${trimmed.slice(0, maxLen)}...`;
}
//# sourceMappingURL=fileExtract.js.map