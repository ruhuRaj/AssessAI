import mongoose from 'mongoose';
export interface IUser {
    name: string;
    email: string;
    password: string;
    schoolName?: string;
    profileImageUrl?: string;
    emailVerified: boolean;
    createdAt: Date;
    updatedAt: Date;
}
export declare const User: mongoose.Model<IUser, {}, {}, {}, mongoose.Document<unknown, {}, IUser> & IUser & {
    _id: mongoose.Types.ObjectId;
}, any>;
//# sourceMappingURL=User.d.ts.map