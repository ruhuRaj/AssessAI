export interface GenerationRequest {
    title: string;
    subject: string;
    numberOfQuestions: number;
    questionTypes: string[];
    difficulty: string;
    totalMarks: number;
    additionalInstructions?: string;
    fileContent?: string;
}
interface ParsedQuestion {
    id: string;
    text: string;
    difficulty: 'easy' | 'medium' | 'hard';
    marks: number;
    options?: string[];
}
interface ParsedSection {
    id: string;
    title: string;
    instructions: string;
    questions: ParsedQuestion[];
}
export declare class AIService {
    private apiKey;
    private model;
    constructor();
    generateQuestions(request: GenerationRequest): Promise<string>;
    private buildPrompt;
    parseAiResponse(rawResponse: string): ParsedSection[];
}
export {};
//# sourceMappingURL=AIService.d.ts.map