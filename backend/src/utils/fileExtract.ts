import fs from 'fs/promises';
import path from 'path';

export async function extractTextFromFile(
  filePath: string,
  originalName: string
): Promise<string> {
  const ext = path.extname(originalName).toLowerCase();

  if (ext === '.txt') {
    return fs.readFile(filePath, 'utf-8');
  }

  if (ext === '.pdf') {
    try {
      const { PDFParse } = await import('pdf-parse');
      const buffer = await fs.readFile(filePath);
      const parser = new PDFParse({ data: buffer });
      const result = await parser.getText();
      await parser.destroy();
      return result.text?.trim() || '';
    } catch {
      return '';
    }
  }

  return '';
}

export function truncateReferenceContent(text: string, maxLen = 8000): string {
  const trimmed = text.replace(/\s+/g, ' ').trim();
  if (trimmed.length <= maxLen) return trimmed;
  return `${trimmed.slice(0, maxLen)}...`;
}
