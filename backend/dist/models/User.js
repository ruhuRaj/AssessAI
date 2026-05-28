"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const userSchema = new mongoose_1.default.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
    },
    password: {
        type: String,
        required: true,
        minlength: 6,
    },
    schoolName: {
        type: String,
        trim: true,
    },
    profileImageUrl: {
        type: String,
    },
    emailVerified: {
        type: Boolean,
        default: true,
    },
    createdAt: {
        type: Date,
        default: () => new Date(),
    },
    updatedAt: {
        type: Date,
        default: () => new Date(),
    },
});
userSchema.pre('save', function (next) {
    this.updatedAt = new Date();
    next();
});
exports.User = mongoose_1.default.model('User', userSchema);
//# sourceMappingURL=User.js.map