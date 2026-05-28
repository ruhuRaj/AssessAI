import { Request, Response, NextFunction } from 'express';
export interface ApiRequest extends Request {
    userId?: string;
}
export declare const errorHandler: (err: any, req: Request, res: Response, next: NextFunction) => Response<any, Record<string, any>> | undefined;
export declare const asyncHandler: (fn: Function) => (req: Request, res: Response, next: NextFunction) => void;
//# sourceMappingURL=errorHandler.d.ts.map