"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticate = void 0;
exports.signToken = signToken;
exports.toPublicUser = toPublicUser;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const User_1 = require("../models/User");
const JWT_SECRET = process.env.JWT_SECRET || 'veda-dev-secret-change-in-production';
function signToken(userId, email, name) {
    const expiresIn = (process.env.JWT_EXPIRES_IN || '7d');
    return jsonwebtoken_1.default.sign({ sub: userId, email, name }, JWT_SECRET, { expiresIn });
}
const authenticate = async (req, res, next) => {
    try {
        const header = req.headers.authorization;
        if (!header?.startsWith('Bearer ')) {
            return res.status(401).json({ error: 'Authentication required' });
        }
        const token = header.slice(7);
        const payload = jsonwebtoken_1.default.verify(token, JWT_SECRET);
        const user = await User_1.User.findById(payload.sub).select('_id email name');
        if (!user) {
            return res.status(401).json({ error: 'User not found' });
        }
        req.user = {
            id: String(user._id),
            email: user.email,
            name: user.name,
        };
        next();
    }
    catch {
        return res.status(401).json({ error: 'Invalid or expired token' });
    }
};
exports.authenticate = authenticate;
function toPublicUser(user) {
    return {
        id: String(user._id),
        name: user.name,
        email: user.email,
        schoolName: user.schoolName,
        profileImageUrl: user.profileImageUrl,
        createdAt: user.createdAt,
    };
}
//# sourceMappingURL=auth.js.map