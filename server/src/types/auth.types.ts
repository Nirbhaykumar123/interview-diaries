export interface CreateUserInput {
  email: string;
  username: string;
  passwordHash: string;
  fullName: string;
  college?: string;
  course: 'BTECH' | 'MTECH';
  branch: string;
  graduationYear: number;
  emailVerificationToken?: string;
  emailVerificationTokenExpiresAt?: Date;
}

export interface RegisterInput {
  email: string;
  username: string;
  password: string;
  fullName: string;
  course: 'BTECH' | 'MTECH';
  branch: string;
  graduationYear: number;
}

export interface UserResponse {
  id: string;
  email: string;
  username: string;
  fullName: string;
  college: string;
  course: string;
  branch: string;
  graduationYear: number;
  role: string;
  createdAt: Date;
}

