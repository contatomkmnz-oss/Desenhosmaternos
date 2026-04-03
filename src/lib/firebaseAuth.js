/**
 * Funções de autenticação com fallback automático.
 *
 * - Com Firebase configurado: usa Firebase Auth real.
 * - Sem Firebase configurado: usa o modo demo (localStorage, qualquer senha serve).
 */
import {
  browserLocalPersistence,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  sendPasswordResetEmail,
  setPersistence,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
} from 'firebase/auth';
import { firebaseEnabled, firebaseAuth, googleProvider } from './firebase';
import { LS_LOGGED_IN } from '@/config/storageKeys';

/* ------------------------------------------------------------------ */
/* Mensagens de erro Firebase → português                              */
/* ------------------------------------------------------------------ */

const FIREBASE_ERRORS = {
  'auth/user-not-found': 'Usuário não encontrado. Verifique o e-mail.',
  'auth/wrong-password': 'Senha incorreta.',
  'auth/invalid-email': 'E-mail inválido.',
  'auth/invalid-credential': 'E-mail ou senha incorretos.',
  'auth/too-many-requests': 'Muitas tentativas. Aguarde alguns minutos e tente novamente.',
  'auth/network-request-failed': 'Falha de conexão. Verifique sua internet.',
  'auth/user-disabled': 'Esta conta foi desativada.',
  'auth/email-already-in-use': 'Este e-mail já está cadastrado.',
  'auth/weak-password': 'A senha deve ter pelo menos 6 caracteres.',
  'auth/popup-closed-by-user': '',       // Silencioso — usuário fechou
  'auth/cancelled-popup-request': '',    // Silencioso — outra popup aberta
  'auth/popup-blocked': 'Popup bloqueada pelo navegador. Permita popups para este site.',
  'auth/operation-not-allowed': 'Método de login não habilitado. Ative no Firebase Console.',
  'auth/unauthorized-domain': 'Domínio não autorizado. Adicione este domínio no Firebase Auth.',
  'auth/account-exists-with-different-credential': 'Esta conta já existe com outro método de login.',
};

function mapFirebaseError(err) {
  const msg = FIREBASE_ERRORS[err?.code];
  if (msg !== undefined) return msg;            // pode ser string vazia (silencioso)
  return err?.message || 'Erro ao autenticar. Tente novamente.';
}

/* ------------------------------------------------------------------ */
/* Helpers de sessão local (mantém compatibilidade com RequireAuth)    */
/* ------------------------------------------------------------------ */

function setLoggedIn() {
  try { localStorage.setItem(LS_LOGGED_IN, 'true'); } catch {}
}

function clearLoggedIn() {
  try { localStorage.removeItem(LS_LOGGED_IN); } catch {}
}

async function ensureFirebasePersistence() {
  if (!firebaseEnabled) return;
  await setPersistence(firebaseAuth, browserLocalPersistence);
}

/* ------------------------------------------------------------------ */
/* Login com e-mail e senha                                            */
/* ------------------------------------------------------------------ */

export async function authLoginEmail(email, password) {
  if (firebaseEnabled) {
    await ensureFirebasePersistence();
    const cred = await signInWithEmailAndPassword(firebaseAuth, email, password).catch((err) => {
      const msg = mapFirebaseError(err);
      throw new Error(msg || 'Erro ao autenticar.');
    });
    setLoggedIn();
    return cred.user;
  }

  /* ---- Modo demo ---- */
  if (!email?.trim()) throw new Error('Informe seu e-mail.');
  if (!password) throw new Error('Informe sua senha.');
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!re.test(email.trim())) throw new Error('E-mail inválido.');
  setLoggedIn();
  return { email: email.trim().toLowerCase(), uid: 'demo-uid', displayName: null };
}

export async function authSignUpEmail(email, password) {
  if (firebaseEnabled) {
    await ensureFirebasePersistence();
    const cred = await createUserWithEmailAndPassword(firebaseAuth, email, password).catch((err) => {
      const msg = mapFirebaseError(err);
      throw new Error(msg || 'Erro ao criar conta.');
    });
    setLoggedIn();
    return cred.user;
  }

  return authLoginEmail(email, password);
}

/* ------------------------------------------------------------------ */
/* Login com Google                                                    */
/* ------------------------------------------------------------------ */

export async function authLoginGoogle() {
  if (!firebaseEnabled) {
    throw new Error(
      'Login com Google requer o Firebase configurado. ' +
      'No modo demonstração, use e-mail e senha.'
    );
  }

  await ensureFirebasePersistence();
  const result = await signInWithPopup(firebaseAuth, googleProvider).catch((err) => {
    const msg = mapFirebaseError(err);
    if (!msg) return null;   // usuário fechou a popup — sem erro visível
    throw new Error(msg);
  });

  if (!result) return null;
  setLoggedIn();
  return result.user;
}

/* ------------------------------------------------------------------ */
/* Logout                                                              */
/* ------------------------------------------------------------------ */

export async function authLogout() {
  if (firebaseEnabled) {
    try { await signOut(firebaseAuth); } catch {}
  }
  clearLoggedIn();
}

/* ------------------------------------------------------------------ */
/* Recuperar senha                                                     */
/* ------------------------------------------------------------------ */

export async function authForgotPassword(email) {
  if (!firebaseEnabled) {
    throw new Error('Recuperação de senha requer Firebase configurado.');
  }
  if (!email?.trim()) throw new Error('Informe seu e-mail primeiro.');
  await sendPasswordResetEmail(firebaseAuth, email.trim()).catch((err) => {
    throw new Error(mapFirebaseError(err) || 'Erro ao enviar e-mail de recuperação.');
  });
}

/* ------------------------------------------------------------------ */
/* Listener de estado de autenticação (Firebase → synca flag local)   */
/* ------------------------------------------------------------------ */

/**
 * Registra um listener que mantém a flag localStorage em sincronia com o
 * estado do Firebase. Retorna a função de unsubscribe.
 *
 * Chame em App.jsx para garantir que a flag seja correta após refresh.
 */
export function subscribeFirebaseAuthState(onChange) {
  if (!firebaseEnabled) {
    onChange(null);   // modo demo
    return () => {};
  }

  return onAuthStateChanged(firebaseAuth, (user) => {
    if (user) setLoggedIn();
    else clearLoggedIn();
    onChange(user);
  });
}

export function getFirebaseCurrentUser() {
  if (!firebaseEnabled) return null;
  return firebaseAuth.currentUser;
}
