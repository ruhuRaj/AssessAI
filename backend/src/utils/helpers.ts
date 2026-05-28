import { v4 as uuidv4 } from 'uuid';

export const generateId = (): string => uuidv4();

export const delay = (ms: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));

export class AppError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public details?: any
  ) {
    super(message);
  }
}

export const validateEmail = (email: string): boolean => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

export const parseMarkString = (marks: string | number): number => {
  const num = parseInt(String(marks), 10);
  return isNaN(num) || num < 0 ? 0 : num;
};

export const capitalizeWords = (str: string): string => {
  return str
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};
