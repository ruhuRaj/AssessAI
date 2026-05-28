"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteUserAccount = deleteUserAccount;
const promises_1 = __importDefault(require("fs/promises"));
const path_1 = __importDefault(require("path"));
const Assignment_1 = require("../models/Assignment");
const QuestionPaper_1 = require("../models/QuestionPaper");
const User_1 = require("../models/User");
const otpService_1 = require("./otpService");
const cloudinaryService_1 = require("./cloudinaryService");
async function deleteUserAccount(userId) {
    const user = await User_1.User.findById(userId);
    if (!user) {
        throw new Error('User not found');
    }
    const assignments = await Assignment_1.Assignment.find({ teacherId: userId }).select('_id');
    const assignmentIds = assignments.map((a) => a._id);
    if (assignmentIds.length > 0) {
        await QuestionPaper_1.QuestionPaper.deleteMany({ assignmentId: { $in: assignmentIds } });
        await Assignment_1.Assignment.deleteMany({ teacherId: userId });
    }
    if (user.profileImageUrl?.includes('res.cloudinary.com')) {
        await (0, cloudinaryService_1.deleteProfileImage)(user.profileImageUrl);
    }
    else if (user.profileImageUrl?.startsWith('/uploads/')) {
        const filePath = path_1.default.join(process.cwd(), user.profileImageUrl.replace(/^\//, ''));
        try {
            await promises_1.default.unlink(filePath);
        }
        catch {
            /* file may already be missing */
        }
    }
    await (0, otpService_1.clearOtpsForEmail)(user.email);
    await User_1.User.deleteOne({ _id: userId });
}
//# sourceMappingURL=accountService.js.map