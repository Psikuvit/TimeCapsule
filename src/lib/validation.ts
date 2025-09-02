import { z } from 'zod';

// User input validation schemas
export const createCapsuleSchema = z.object({
  message: z.string()
    .min(1, 'Message cannot be empty')
    .max(1000, 'Message cannot exceed 1000 characters')
    .trim(),
  deliveryDate: z.string()
    .refine((date) => {
      const parsedDate = new Date(date);
      const now = new Date();
      const minDate = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24 hours from now
      return parsedDate > minDate;
    }, 'Delivery date must be at least 24 hours in the future'),
});

export const updateUserSchema = z.object({
  name: z.string()
    .min(1, 'Name cannot be empty')
    .max(100, 'Name cannot exceed 100 characters')
    .trim(),
  email: z.string()
    .email('Invalid email format')
    .max(255, 'Email cannot exceed 255 characters')
    .trim(),
});

export const authCompleteSchema = z.object({
  code: z.string().min(1, 'Authorization code is required'),
  state: z.string().min(1, 'State parameter is required'),
});

// Sanitization functions
export function sanitizeString(input: string): string {
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .substring(0, 1000); // Limit length
}

export function sanitizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function validateDeliveryDate(date: string): Date | null {
  try {
    const parsedDate = new Date(date);
    if (isNaN(parsedDate.getTime())) {
      return null;
    }
    
    const now = new Date();
    const minDate = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24 hours from now
    
    if (parsedDate <= minDate) {
      return null;
    }
    
    return parsedDate;
  } catch {
    return null;
  }
}
