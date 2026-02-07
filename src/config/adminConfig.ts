export const ADMIN_EMAILS: string[] = [
  (import.meta as any).env.VITE_ADMIN_EMAIL_1 ?? '',
  (import.meta as any).env.VITE_ADMIN_EMAIL_2 ?? '',
  (import.meta as any).env.VITE_ADMIN_EMAIL_3 ?? '',
].filter(Boolean);

