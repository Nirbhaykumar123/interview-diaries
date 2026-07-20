import bcrypt from 'bcrypt';

// Best practice: Use a cost factor of 12 for password hashing in production.
// Hashing cost factor represents the number of iterations (2^12 = 4096 rounds).
// It strikes the optimal balance between security (making brute-force attacks too slow)
// and user experience/server resources (completing in ~100-200ms).
const SALT_ROUNDS = 12;

export const hashPassword = async (password: string): Promise<string> => {
  return bcrypt.hash(password, SALT_ROUNDS);
};

export const comparePassword = async (password: string, hash: string): Promise<boolean> => {
  return bcrypt.compare(password, hash);
};
