export const useFirestoreData =
  import.meta.env.VITE_USE_FIRESTORE === 'true';

export const adminEmail = String(import.meta.env.VITE_ADMIN_EMAIL || '')
  .trim()
  .toLowerCase();
