export const useFirestoreData =
  import.meta.env.VITE_USE_FIRESTORE === 'true';

function normalizeEmail(value) {
  return String(value || '').trim().toLowerCase();
}

const configuredAdminEmails = String(import.meta.env.VITE_ADMIN_EMAIL || '')
  .split(',')
  .map(normalizeEmail)
  .filter(Boolean);

const fallbackAdminEmails = ['fourhokage224@gmail.com'];

export const adminEmails = Array.from(
  new Set([...configuredAdminEmails, ...fallbackAdminEmails])
);

export const adminEmail = adminEmails[0] || '';

export const isProductionApp = import.meta.env.PROD;
export const enableAdminPanel = adminEmails.length > 0;
