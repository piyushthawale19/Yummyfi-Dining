import type { User } from 'firebase/auth';
import { ADMIN_EMAILS } from '../config/adminConfig';

export const isAdminEmail = (email: string | null | undefined): boolean => {
  if (!email) return false;
  return ADMIN_EMAILS.includes(email);
};

export type AuthUser = User | null;

