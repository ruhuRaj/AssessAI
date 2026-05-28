import { Readable } from 'stream';
interface PaperSection {
    title: string;
    instructions?: string;
    questions: {
        text: string;
        difficulty?: string;
        marks?: number;
        options?: string[];
    }[];
}
export declare class PDFService {
    generateQuestionPaperPDF(sections: PaperSection[], metadata: {
        title: string;
        subject: string;
        totalMarks: number;
    }): Readable;
}
export declare const pdfService: PDFService;
export {};
//# sourceMappingURL=PDFService.d.ts.map