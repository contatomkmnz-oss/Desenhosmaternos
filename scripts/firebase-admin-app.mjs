import { initializeApp, applicationDefault, cert, getApps } from 'firebase-admin/app';

function parseServiceAccountFromEnv() {
  if (!process.env.FIREBASE_SERVICE_ACCOUNT_JSON) return null;
  return JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);
}

export function getAdminApp() {
  if (getApps().length > 0) {
    return getApps()[0];
  }

  const serviceAccount = parseServiceAccountFromEnv();

  if (serviceAccount) {
    return initializeApp({
      credential: cert(serviceAccount),
    });
  }

  return initializeApp({
    credential: applicationDefault(),
  });
}
