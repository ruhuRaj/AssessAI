import { Queue } from 'bullmq';
export declare const questionGenerationQueue: Queue<any, any, string, any, any, string>;
export declare const pdfGenerationQueue: Queue<any, any, string, any, any, string>;
export declare const initializeQueues: () => Promise<void>;
//# sourceMappingURL=queue.d.ts.map