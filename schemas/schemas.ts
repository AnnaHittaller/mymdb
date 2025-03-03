import { z } from 'zod';

// Login schema
export const loginSchema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(6, 'Must be at least 6 characters'),
});

// Register schema
export const registerSchema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(6, 'Must be at least 6 characters'),
  username: z.string().min(3, 'Must be at least 3 characters').max(30, 'Too long - must be under 30 characters'),
});

// Forgot Password schema
export const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email'),
});

// Contact schema 
export const contactSchema = z.object({
  subject: z.string().min(1, 'Subject is required'),
  message: z.string().min(1, 'Message is required'),
});

// Export types
export type LoginSchema = z.infer<typeof loginSchema>;
export type RegisterSchema = z.infer<typeof registerSchema>;
export type ForgotPasswordSchema = z.infer<typeof forgotPasswordSchema>;
export type ContactSchema = z.infer<typeof contactSchema>;