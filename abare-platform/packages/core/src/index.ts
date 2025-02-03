import { format, parseISO } from 'date-fns';
import { Document, Property, isDocument, isProperty } from './types';

// Date formatting utilities
export function formatDate(date: Date | string): string {
  const parsedDate = typeof date === 'string' ? parseISO(date) : date;
  return format(parsedDate, 'yyyy-MM-dd');
}

export function formatDateTime(date: Date | string): string {
  const parsedDate = typeof date === 'string' ? parseISO(date) : date;
  return format(parsedDate, 'yyyy-MM-dd HH:mm:ss');
}

// Document Functions
export function validateDocument(data: Document): Document {
  if (!isDocument(data)) {
    throw new Error('Invalid document data');
  }
  return data;
}

// Property Functions
export function validateProperty(data: Property): Property {
  if (!isProperty(data)) {
    throw new Error('Invalid property data');
  }
  return data;
}

// Re-export types
export * from './types';
