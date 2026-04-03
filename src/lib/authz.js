import { adminEmails } from '@/config/appConfig';

function normalizeEmail(value) {
  return String(value || '').trim().toLowerCase();
}

function extractEmails(user) {
  const emails = [
    user?.email,
    ...(user?.providerData?.map((provider) => provider?.email) || []),
  ];

  return Array.from(new Set(emails.map(normalizeEmail).filter(Boolean)));
}

function hasAdminFlag(user) {
  return Boolean(
    user?.role === 'admin' ||
    user?.admin === true ||
    user?.is_admin === true ||
    user?.claims?.admin === true ||
    user?.customClaims?.admin === true
  );
}

export function isAdmin(user) {
  if (!user) return false;
  if (hasAdminFlag(user)) return true;
  if (adminEmails.length === 0) return false;
  return extractEmails(user).some((email) => adminEmails.includes(email));
}

export function withAdminRole(user) {
  if (!user) return null;
  return {
    ...user,
    role: isAdmin(user) ? 'admin' : user.role || 'user',
  };
}
