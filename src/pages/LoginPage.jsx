import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { firebaseEnabled } from '@/lib/firebase';
import { useAuth } from '@/lib/AuthContext';
import { brand } from '@/data/siteContent';

/* ---------- SVG inline icons (sem dependência extra) ---------- */

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-[18px] h-[18px] shrink-0" aria-hidden>
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </svg>
  );
}

function FacebookIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-[18px] h-[18px] shrink-0" fill="#1877F2" aria-hidden>
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  );
}

function AppleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-[18px] h-[18px] shrink-0" fill="currentColor" aria-hidden>
      <path d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701" />
    </svg>
  );
}

/* ---------- Input component ---------- */

function Field({ label, id, type, value, onChange, placeholder, rightSlot, autoComplete, disabled }) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="block text-[13px] font-medium text-[#374151]">
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          autoComplete={autoComplete}
          disabled={disabled}
          className="w-full h-11 px-4 rounded-lg border border-[#D1D5DB] bg-white text-[#111827] placeholder-[#9CA3AF] text-sm outline-none transition-all duration-150 focus:border-[#111827] focus:ring-2 focus:ring-[#111827]/10 disabled:bg-[#F9FAFB] disabled:cursor-not-allowed"
        />
        {rightSlot && (
          <div className="absolute inset-y-0 right-0 flex items-center pr-3">
            {rightSlot}
          </div>
        )}
      </div>
    </div>
  );
}

/* ---------- Social button ---------- */

function SocialButton({ icon, label, onClick, disabled, loading }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="flex w-full h-11 items-center justify-center gap-3 rounded-lg border border-[#E5E7EB] bg-white text-[13px] font-medium text-[#374151] transition-all duration-150 hover:bg-[#F9FAFB] hover:border-[#D1D5DB] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#111827]/20 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : icon}
      {label}
    </button>
  );
}

/* ============================================================
   LoginPage
   ============================================================ */

export default function LoginPage() {
  const navigate = useNavigate();
  const { signInWithEmail, signInWithGoogle, forgotPassword } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState('');
  const [resetSent, setResetSent] = useState(false);

  /* ---- Login e-mail/senha ---- */
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;
    setError('');
    setLoading(true);
    try {
      await signInWithEmail(email.trim(), password);
      navigate('/ProfileSelect', { replace: true });
    } catch (err) {
      setError(err?.message || 'Erro ao entrar. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  /* ---- Login Google ---- */
  const handleGoogle = async () => {
    if (googleLoading || loading) return;
    setError('');
    setGoogleLoading(true);
    try {
      const user = await signInWithGoogle();
      if (user) navigate('/ProfileSelect', { replace: true });
    } catch (err) {
      if (err?.message) setError(err.message);
    } finally {
      setGoogleLoading(false);
    }
  };

  /* ---- Recuperar senha ---- */
  const handleForgotPassword = async () => {
    setError('');
    setResetSent(false);
    try {
      await forgotPassword(email.trim());
      setResetSent(true);
    } catch (err) {
      setError(err?.message || 'Informe seu e-mail e tente novamente.');
    }
  };

  const busy = loading || googleLoading;

  return (
    <div className="min-h-screen bg-[#F3F4F6] flex flex-col items-center justify-center px-4 py-12">

      {/* ── Card ── */}
      <div className="w-full max-w-[420px] rounded-2xl bg-white border border-[#E5E7EB] shadow-[0_4px_40px_rgba(0,0,0,0.08)] px-8 py-10">

        {/* Logo + heading */}
        <div className="mb-7 text-center">
          <img
            src={brand.logoUrl}
            alt={brand.name}
            className="h-12 w-auto mx-auto mb-5 object-contain select-none"
            draggable={false}
          />
          <h1 className="text-[22px] font-bold text-[#111827] leading-tight tracking-tight">
            Bem-vindo de volta
          </h1>
          <p className="mt-1.5 text-[13.5px] text-[#6B7280]">
            Entre na sua conta para continuar assistindo
          </p>
        </div>

        {/* Social buttons */}
        <div className="space-y-2.5 mb-5">
          <SocialButton
            icon={<GoogleIcon />}
            label="Continuar com Google"
            onClick={handleGoogle}
            disabled={busy}
            loading={googleLoading}
          />
          <SocialButton
            icon={<FacebookIcon />}
            label="Continuar com Facebook"
            onClick={() => setError('Login com Facebook em breve.')}
            disabled={busy}
          />
          <SocialButton
            icon={<AppleIcon />}
            label="Continuar com Apple"
            onClick={() => setError('Login com Apple em breve.')}
            disabled={busy}
          />
        </div>

        {/* Divider */}
        <div className="flex items-center gap-3 my-5">
          <div className="flex-1 h-px bg-[#E5E7EB]" />
          <span className="text-[11px] font-semibold text-[#9CA3AF] tracking-widest uppercase select-none">
            ou
          </span>
          <div className="flex-1 h-px bg-[#E5E7EB]" />
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          <Field
            id="email"
            label="E-mail"
            type="email"
            value={email}
            onChange={(e) => { setEmail(e.target.value); setError(''); setResetSent(false); }}
            placeholder="voce@email.com"
            autoComplete="email"
            disabled={busy}
          />

          <Field
            id="password"
            label="Senha"
            type={showPass ? 'text' : 'password'}
            value={password}
            onChange={(e) => { setPassword(e.target.value); setError(''); }}
            placeholder="••••••••"
            autoComplete="current-password"
            disabled={busy}
            rightSlot={
              <button
                type="button"
                tabIndex={-1}
                onClick={() => setShowPass((v) => !v)}
                className="text-[#9CA3AF] hover:text-[#374151] transition-colors focus-visible:outline-none"
                aria-label={showPass ? 'Ocultar senha' : 'Mostrar senha'}
              >
                {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            }
          />

          {/* Feedback */}
          {error && (
            <div
              role="alert"
              className="rounded-lg bg-[#FEF2F2] border border-[#FECACA] px-4 py-3 text-[13px] text-[#B91C1C] leading-snug"
            >
              {error}
            </div>
          )}
          {resetSent && (
            <div
              role="status"
              className="rounded-lg bg-[#F0FDF4] border border-[#BBF7D0] px-4 py-3 text-[13px] text-[#15803D] leading-snug"
            >
              E-mail de recuperação enviado! Verifique sua caixa de entrada.
            </div>
          )}

          {/* Forgot password */}
          <div className="text-right -mt-1">
            <button
              type="button"
              onClick={handleForgotPassword}
              disabled={busy}
              className="text-[12.5px] text-[#6B7280] hover:text-[#111827] hover:underline transition-colors focus-visible:outline-none focus-visible:underline disabled:opacity-50"
            >
              Esqueceu a senha?
            </button>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={busy || !email.trim() || !password}
            className="mt-1 flex w-full h-11 items-center justify-center gap-2.5 rounded-lg bg-[#111827] text-white text-[13.5px] font-semibold tracking-wide transition-all duration-150 hover:bg-[#1F2937] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#111827]/30 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Entrando…
              </>
            ) : (
              'Entrar'
            )}
          </button>
        </form>

        {/* Sign up link */}
        <p className="mt-6 text-center text-[13px] text-[#6B7280]">
          Não tem uma conta?{' '}
          <a
            href="https://w.app/gjq1dk"
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-[#111827] hover:underline focus-visible:outline-none focus-visible:underline"
          >
            Fale conosco
          </a>
        </p>
      </div>

      {/* Footer note */}
      <p className="mt-6 text-[11.5px] text-[#9CA3AF] text-center max-w-xs leading-relaxed">
        {firebaseEnabled
          ? 'Autenticação Firebase ativa.'
          : 'Modo demonstração — qualquer e-mail e senha funcionam.'}
      </p>
    </div>
  );
}
