import { adminEmail } from '@/config/appConfig';

function normalizeEmail(value) {
  return String(value || '').trim().toLowerCase();
}

export function isAdmin(user) {
  if (!user) return false;
  if (!adminEmail) return false;
  return normalizeEmail(user.email) === adminEmail;
}

export function withAdminRole(user) {
  if (!user) return null;
  return {
    ...user,
    role: isAdmin(user) ? 'admin' : user.role || 'user',
  };
}
