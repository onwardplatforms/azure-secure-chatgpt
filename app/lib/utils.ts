import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

import { nanoid } from 'nanoid';

export function generateNanoid(): string {
  return nanoid();
}

// import bcrypt from 'bcryptjs';

// export async function verifyPasswordHash(
//   password: string,
//   hash: string
// ): Promise<boolean> {
//   return bcrypt.compare(password, hash);
// }
