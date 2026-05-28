export declare const generateId: () => string;
export declare const delay: (ms: number) => Promise<void>;
export declare class AppError extends Error {
    statusCode: number;
    message: string;
    details?: any | undefined;
    constructor(statusCode: number, message: string, details?: any | undefined);
}
export declare const validateEmail: (email: string) => boolean;
export declare const parseMarkString: (marks: string | number) => number;
export declare const capitalizeWords: (str: string) => string;
//# sourceMappingURL=helpers.d.ts.map