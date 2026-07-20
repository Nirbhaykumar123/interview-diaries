import { z } from 'zod';

export const registerSchema = z.object({
  body: z.object({
    email: z
      .string()
      .min(1, 'Email is required')
      .email('Invalid email address')
      .max(255, 'Email cannot exceed 255 characters')
      .regex(
        /^[a-zA-Z0-9.]+_[bBmMpP]\d{6}[a-zA-Z]{2}@nitc\.ac\.in$/,
        'Only verified NIT Calicut student emails (<roll_number>@nitc.ac.in) are allowed. Example: nirbhay_b230468ec@nitc.ac.in'
      )
      .trim()
      .toLowerCase(),
    username: z
      .string()
      .min(3, 'Username must be at least 3 characters')
      .max(50, 'Username cannot exceed 50 characters')
      .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain alphanumeric characters and underscores')
      .trim()
      .toLowerCase(),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
      .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
      .regex(/[0-9]/, 'Password must contain at least one digit'),
    fullName: z
      .string()
      .min(2, 'Full name must be at least 2 characters')
      .max(100, 'Full name cannot exceed 100 characters')
      .trim(),
    course: z.enum(['BTECH', 'MTECH'] as const),
    branch: z
      .string()
      .min(1, 'Branch name is required')
      .max(100, 'Branch cannot exceed 100 characters')
      .trim(),
    graduationYear: z
      .number()
      .int()
      .min(2000, 'Invalid graduation year')
      .max(2100, 'Invalid graduation year'),
  }).refine((data) => {
    const localPart = data.email.split('@')[0];
    const match = localPart.match(/_([bBmMpP])(\d{6})([a-zA-Z]{2})$/);
    if (!match) return false;

    const [_, degreeLetter, admissionYearStr] = match;
    const expectedCourse = degreeLetter.toUpperCase() === 'B' ? 'BTECH' : 'MTECH';
    if (data.course !== expectedCourse) return false;

    const admissionYear = 2000 + parseInt(admissionYearStr.substring(0, 2), 10);
    const expectedGraduationYear = expectedCourse === 'BTECH' ? admissionYear + 4 : admissionYear + 2;
    if (data.graduationYear !== expectedGraduationYear) return false;

    return true;
  }, {
    message: 'Submitted Course or Graduation Year does not match your student email roll number credentials',
    path: ['email']
  }),
});

export const verifyEmailSchema = z.object({
  body: z.object({
    token: z.string().min(1, 'Verification token is required').trim(),
  }),
});

export const loginSchema = z.object({
  body: z.object({
    email: z
      .string()
      .min(1, 'Email is required')
      .email('Invalid email address')
      .trim()
      .toLowerCase(),
    password: z
      .string()
      .min(1, 'Password is required'),
  }),
});
