import { getAuth } from 'firebase-admin/auth';
import { getAdminApp } from './firebase-admin-app.mjs';

const adminEmail = String(process.env.VITE_ADMIN_EMAIL || '').trim().toLowerCase();

if (!adminEmail) {
  throw new Error('Defina VITE_ADMIN_EMAIL antes de executar o script.');
}

const app = getAdminApp();
const auth = getAuth(app);
const user = await auth.getUserByEmail(adminEmail);

await auth.setCustomUserClaims(user.uid, {
  ...(user.customClaims || {}),
  admin: true,
});

console.log(`Claim admin=true aplicada com sucesso para ${adminEmail}.`);
