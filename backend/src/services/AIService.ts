import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

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

export class AIService {
  private apiKey: string;
  private model: string;

  constructor() {
    this.apiKey = process.env.LLM_API_KEY || '';
    this.model = process.env.LLM_MODEL || 'gpt-4-turbo-preview';
  }

  async generateQuestions(request: GenerationRequest): Promise<string> {
    const prompt = this.buildPrompt(request);

    try {
      const response = await axios.post(
        'https://api.groq.com/openai/v1/chat/completions',
        {
          model: this.model,
          messages: [
            {
              role: 'system',
              content: `You are an expert educational assessment creator. Generate high-quality questions in JSON format.
              Always respond with valid JSON only, no markdown, no code blocks.`,
            },
            {
              role: 'user',
              content: prompt,
            },
          ],
          temperature: 0.7,
          max_tokens: 4000,
        },
        {
          headers: {
            Authorization: `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
          },
        }
      );

      const content = response.data.choices[0].message.content;
      return content;
    } catch (error) {
      console.error('AI Generation Error:', error);
      throw new Error('Failed to generate questions from AI');
    }
  }

  private buildPrompt(request: GenerationRequest): string {
    const typesList = request.questionTypes.join(', ');
    return `You are an expert exam paper author. Create an assessment titled "${request.title}" for ${request.subject}.

Constraints:
- Exactly ${request.numberOfQuestions} questions totaling ${request.totalMarks} marks
- Question types to include: ${typesList}
- Overall difficulty: ${request.difficulty} (distribute easy/medium/hard appropriately)
- Group questions into logical sections (e.g. Section A for MCQ, Section B for short answer)
- For MCQ questions, include an "options" array with exactly 4 choices
- Each question must have: id, text, difficulty (easy|medium|hard), marks (integer)
${request.additionalInstructions ? `\nTeacher instructions:\n${request.additionalInstructions}` : ''}
${request.fileContent ? `\nReference material (use for context):\n${request.fileContent}` : ''}

Return ONLY valid JSON (no markdown fences) in this shape:
{
  "sections": [
    {
      "id": "A",
      "title": "Section A — Multiple Choice",
      "instructions": "Choose the correct option",
      "questions": [
        {
          "id": "1",
          "text": "...",
          "difficulty": "easy",
          "marks": 2,
          "options": ["A", "B", "C", "D"]
        }
      ]
    }
  ]
}

Marks across all questions must sum to ${request.totalMarks}.`;
  }

  parseAiResponse(rawResponse: string): ParsedSection[] {
    try {
      // Remove markdown code blocks if present
      let jsonStr = rawResponse
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .trim();

      const parsed = JSON.parse(jsonStr);
      
      if (parsed.sections && Array.isArray(parsed.sections)) {
        return parsed.sections.map((section: any) => ({
          id: section.id || 'A',
          title: section.title || `Section ${section.id}`,
          instructions: section.instructions || 'Attempt all questions',
          questions: (section.questions || []).map((q: any, idx: number) => ({
            id: q.id || String(idx + 1),
            text: q.text,
            difficulty: q.difficulty || 'medium',
            marks: q.marks || 1,
            options: q.options,
          })),
        }));
      }

      throw new Error('Invalid response structure');
    } catch (error) {
      console.error('Parse Error:', error);
      throw new Error('Failed to parse AI response');
    }
  }
}
