import { Request, Response, NextFunction } from 'express';
export declare function signToken(userId: string, email: string, name: string): string;
export declare const authenticate: (req: Request, res: Response, next: NextFunction) => Promise<Response<any, Record<string, any>> | undefined>;
export declare function toPublicUser(user: {
    _id: unknown;
    name: string;
    email: string;
    schoolName?: string;
    profileImageUrl?: string;
    createdAt?: Date;
}): {
    id: string;
    name: string;
    email: string;
    schoolName: string | undefined;
    profileImageUrl: string | undefined;
    createdAt: Date | undefined;
};
//# sourceMappingURL=auth.d.ts.map