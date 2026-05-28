"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadAvatar = void 0;
const multer_1 = __importDefault(require("multer"));
const allowed = new Set([
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/gif',
]);
/** Memory storage — file is uploaded to Cloudinary from the buffer */
exports.uploadAvatar = (0, multer_1.default)({
    storage: multer_1.default.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (_req, file, cb) => {
        const ext = file.originalname.toLowerCase();
        if (allowed.has(file.mimetype) ||
            ['.jpg', '.jpeg', '.png', '.webp', '.gif'].some((e) => ext.endsWith(e))) {
            cb(null, true);
        }
        else {
            cb(new Error('Only JPEG, PNG, WebP, or GIF images are allowed'));
        }
    },
}).single('avatar');
//# sourceMappingURL=uploadAvatar.js.map