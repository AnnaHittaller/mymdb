import { z } from 'zod';

// Login schema
export const loginSchema = z.object({
  email: z.email('Invalid email'),
  password: z.string({ error: 'Must be at least 6 characters' }).min(6, 'Must be at least 6 characters'),
});

// Register schema
export const registerSchema = z.object({
  email: z.email('Invalid email'),
  password: z.string({ error: 'Must be at least 6 characters' }).min(6, 'Must be at least 6 characters'),
  username: z.string({ error: 'Must be at least 3 characters' }).min(3, 'Must be at least 3 characters').max(30, 'Too long - must be under 30 characters'),
});

// Forgot Password schema
export const forgotPasswordSchema = z.object({
  email: z.email('Invalid email'),
});

export const editUsernameSchema = z.object({
	username: z
		.string({ error: "Must be at least 3 characters" })
		.min(3, "Must be at least 3 characters")
		.max(30, "Too long - must be under 30 characters"),
});

export const changePasswordSchema = z
	.object({
		currentPassword: z
			.string({ error: "Must be at least 6 characters" })
			.min(6, "Must be at least 6 characters"),
		newPassword: z
			.string({ error: "Must be at least 6 characters" })
			.min(6, "Must be at least 6 characters"),
		confirmPassword: z
			.string({ error: "Must be at least 6 characters" })
			.min(6, "Must be at least 6 characters"),
	})
	.refine((data) => data.newPassword === data.confirmPassword, {
		message: "Passwords do not match",
		path: ["confirmPassword"],
	})
	.refine((data) => data.newPassword !== data.currentPassword, {
		message: "New password must be different",
		path: ["newPassword"],
	});

// Search page (explicit submit)
export const searchQuerySchema = z.object({
  query: z
    .string({ error: 'Enter at least 2 characters' })
    .trim()
    .min(2, 'Enter at least 2 characters'),
});

// Export types
export type LoginSchema = z.infer<typeof loginSchema>;
export type RegisterSchema = z.infer<typeof registerSchema>;
export type ForgotPasswordSchema = z.infer<typeof forgotPasswordSchema>;
export type EditUsernameSchema = z.infer<typeof editUsernameSchema>;
export type ChangePasswordSchema = z.infer<typeof changePasswordSchema>;
export type SearchQuerySchema = z.infer<typeof searchQuerySchema>;