"use client";
import { useState, useEffect, Suspense } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { z } from 'zod';
import { useRouter, useSearchParams } from 'next/navigation';
import { AlertCircle, Loader2 } from 'lucide-react';
import Link from 'next/link';
import Mark from '@/components/landing/Mark';
import { wood, grotesk } from '../forme-fonts';
import '../forme.css';

const emailSchema = z.string().email('Enter a valid email address, like name@example.com');
const passwordSchema = z.string().min(6, 'Use at least 6 characters');

type FieldErrors = { email?: string; password?: string; confirmPassword?: string };

function Field({
  id,
  label,
  error,
  hint,
  ...input
}: {
  id: string;
  label: string;
  error?: string;
  hint?: string;
} & React.InputHTMLAttributes<HTMLInputElement>) {
  const describedBy = error ? `${id}-error` : hint ? `${id}-hint` : undefined;
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-base font-medium">
        {label}
      </label>
      <input
        id={id}
        className="forme-input"
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        {...input}
      />
      {error ? (
        <p id={`${id}-error`} className="mt-1.5 flex items-start gap-1.5 text-sm">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
          {error}
        </p>
      ) : hint ? (
        <p id={`${id}-hint`} className="mt-1.5 text-sm text-[var(--forme-type-dim)]">
          {hint}
        </p>
      ) : null}
    </div>
  );
}

function Submit({ loading, idle, busy }: { loading: boolean; idle: string; busy: string }) {
  return (
    <button
      type="submit"
      disabled={loading}
      className="flex w-full items-center justify-center gap-2 rounded-sm bg-[var(--forme-type)] px-4 py-3 text-lg font-semibold text-[var(--forme-iron)] hover:bg-white disabled:cursor-not-allowed disabled:opacity-60"
    >
      {loading && <Loader2 className="h-5 w-5 motion-safe:animate-spin" aria-hidden />}
      {loading ? busy : idle}
    </button>
  );
}

function Shell({ title, intro, children }: { title: string; intro?: string; children: React.ReactNode }) {
  return (
    <div className={`forme ${wood.variable} ${grotesk.variable} forme-body flex flex-col`}>
      <header className="mx-auto flex w-full max-w-6xl items-center px-4 py-4 sm:px-6">
        <Link href="/" className="flex items-center gap-3" aria-label="NotionCraft AI, back to the home page">
          <Mark className="h-9 w-9" />
          <span className="text-lg font-semibold">NotionCraft AI</span>
        </Link>
      </header>
      <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-4 pb-16 pt-4 sm:px-6">
        <h1 className="forme-display text-center text-4xl sm:text-5xl">{title}</h1>
        {intro && <p className="mt-4 text-center text-lg leading-relaxed text-[var(--forme-type-dim)]">{intro}</p>}
        <div className="forme-chase mt-8">
          <div className="forme-bed px-4 py-5 sm:px-6 sm:py-7">{children}</div>
        </div>
      </main>
    </div>
  );
}

function AuthContent() {
  const { signIn, signUp, user, resetPasswordForEmail, updatePassword } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [recoveryDone, setRecoveryDone] = useState(false);
  const [tab, setTab] = useState<'signin' | 'signup'>('signin');

  // A password recovery callback arrives as ?type=recovery
  const isRecoveryMode = searchParams.get('type') === 'recovery' && !recoveryDone;

  // Redirect if already logged in (unless in recovery mode). Navigating during render is not allowed.
  const signedIn = !!user && !isRecoveryMode;
  useEffect(() => {
    if (signedIn) router.push('/');
  }, [signedIn, router]);
  if (signedIn) return null;

  const clear = (key: keyof FieldErrors) => setErrors(prev => ({ ...prev, [key]: undefined }));

  const validate = (needsConfirm = false) => {
    const newErrors: FieldErrors = {};

    const emailResult = emailSchema.safeParse(email);
    if (!emailResult.success) {
      newErrors.email = emailResult.error.issues[0].message;
    }

    const passwordResult = passwordSchema.safeParse(password);
    if (!passwordResult.success) {
      newErrors.password = passwordResult.error.issues[0].message;
    }

    if (needsConfirm && !newErrors.password && password !== confirmPassword) {
      newErrors.confirmPassword = 'The two passwords differ. Type the same password in both fields.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    const { error } = await signIn(email, password);
    setLoading(false);

    if (error) {
      toast.error('Sign in failed', {
        description: error.message === 'Invalid login credentials'
          ? 'That email and password do not match. Check both and try again.'
          : error.message,
      });
    } else {
      router.push('/');
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate(true)) return;

    setLoading(true);
    const { error } = await signUp(email, password, displayName);
    setLoading(false);

    if (error) {
      if (error.message.includes('already registered')) {
        toast.error('Account exists', {
          description: 'This email already has an account. Sign in instead.',
        });
      } else {
        toast.error('Sign up failed', {
          description: error.message,
        });
      }
    } else {
      toast.success('Account created', {
        description: 'You are signed in.',
      });
      router.push('/');
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    const emailResult = emailSchema.safeParse(email);
    if (!emailResult.success) {
      setErrors({ email: emailResult.error.issues[0].message });
      return;
    }

    setLoading(true);
    const { error } = await resetPasswordForEmail(email);
    setLoading(false);

    if (error) {
      toast.error('Reset failed', {
        description: error.message,
      });
    } else {
      toast.success('Check your email', {
        description: 'We sent a reset link. It may take a minute to arrive.',
      });
      setShowForgotPassword(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    const passwordResult = passwordSchema.safeParse(password);
    if (!passwordResult.success) {
      setErrors({ password: passwordResult.error.issues[0].message });
      return;
    }

    if (password !== confirmPassword) {
      setErrors({ confirmPassword: 'The two passwords differ. Type the same password in both fields.' });
      return;
    }

    setLoading(true);
    const { error } = await updatePassword(password);
    setLoading(false);

    if (error) {
      toast.error('Reset failed', {
        description: error.message,
      });
    } else {
      toast.success('Password updated', {
        description: 'Your new password is saved.',
      });
      setRecoveryDone(true);
      router.push('/');
    }
  };

  // Recovery mode: show password reset form
  if (isRecoveryMode) {
    return (
      <Shell title="Choose a new password">
        <form onSubmit={handleResetPassword} className="space-y-5" noValidate>
          <Field
            id="new-password"
            label="New password"
            type="password"
            autoComplete="new-password"
            value={password}
            error={errors.password}
            hint="At least 6 characters."
            onChange={(e) => {
              setPassword(e.target.value);
              clear('password');
            }}
          />
          <Field
            id="confirm-password"
            label="Confirm new password"
            type="password"
            autoComplete="new-password"
            value={confirmPassword}
            error={errors.confirmPassword}
            onChange={(e) => {
              setConfirmPassword(e.target.value);
              clear('confirmPassword');
            }}
          />
          <Submit loading={loading} idle="Save password" busy="Saving" />
        </form>
      </Shell>
    );
  }

  // Forgot password view
  if (showForgotPassword) {
    return (
      <Shell title="Reset your password" intro="Enter your email and we will send you a link to choose a new one.">
        <form onSubmit={handleForgotPassword} className="space-y-5" noValidate>
          <Field
            id="forgot-email"
            label="Email"
            type="email"
            autoComplete="email"
            placeholder="name@example.com"
            value={email}
            error={errors.email}
            onChange={(e) => {
              setEmail(e.target.value);
              clear('email');
            }}
          />
          <Submit loading={loading} idle="Send reset link" busy="Sending" />
          <button
            type="button"
            className="text-base underline underline-offset-4 hover:text-white"
            onClick={() => setShowForgotPassword(false)}
          >
            Back to sign in
          </button>
        </form>
      </Shell>
    );
  }

  const signingIn = tab === 'signin';

  return (
    <Shell
      title={signingIn ? 'Sign in to your notes' : 'Start your first page'}
      intro={signingIn ? undefined : 'Create an account to write with the assistant. It takes an email and a password.'}
    >
      <div className="mb-6 flex gap-5" role="group" aria-label="Choose sign in or create account">
        {(['signin', 'signup'] as const).map((t) => (
          <button
            key={t}
            type="button"
            aria-pressed={tab === t}
            onClick={() => {
              setTab(t);
              setErrors({});
            }}
            className={`pb-1 text-lg font-semibold underline-offset-8 ${
              tab === t ? 'underline decoration-2' : 'text-[var(--forme-type-dim)] hover:text-white'
            }`}
          >
            {t === 'signin' ? 'Sign in' : 'Create account'}
          </button>
        ))}
      </div>

      {signingIn ? (
        <form onSubmit={handleSignIn} className="space-y-5" noValidate>
          <Field
            id="signin-email"
            label="Email"
            type="email"
            autoComplete="email"
            placeholder="name@example.com"
            value={email}
            error={errors.email}
            onChange={(e) => {
              setEmail(e.target.value);
              clear('email');
            }}
          />
          <Field
            id="signin-password"
            label="Password"
            type="password"
            autoComplete="current-password"
            value={password}
            error={errors.password}
            onChange={(e) => {
              setPassword(e.target.value);
              clear('password');
            }}
          />
          <Submit loading={loading} idle="Sign in" busy="Signing in" />
          <button
            type="button"
            className="text-base underline underline-offset-4 hover:text-white"
            onClick={() => setShowForgotPassword(true)}
          >
            Forgot your password?
          </button>
        </form>
      ) : (
        <form onSubmit={handleSignUp} className="space-y-5" noValidate>
          <Field
            id="signup-name"
            label="Display name (optional)"
            type="text"
            autoComplete="name"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
          />
          <Field
            id="signup-email"
            label="Email"
            type="email"
            autoComplete="email"
            placeholder="name@example.com"
            value={email}
            error={errors.email}
            onChange={(e) => {
              setEmail(e.target.value);
              clear('email');
            }}
          />
          <Field
            id="signup-password"
            label="Password"
            type="password"
            autoComplete="new-password"
            value={password}
            error={errors.password}
            hint="At least 6 characters."
            onChange={(e) => {
              setPassword(e.target.value);
              clear('password');
            }}
          />
          <Field
            id="signup-confirm"
            label="Confirm password"
            type="password"
            autoComplete="new-password"
            value={confirmPassword}
            error={errors.confirmPassword}
            onChange={(e) => {
              setConfirmPassword(e.target.value);
              clear('confirmPassword');
            }}
          />
          <Submit loading={loading} idle="Create account" busy="Creating account" />
        </form>
      )}
    </Shell>
  );
}

export default function Auth() {
  return (
    <Suspense fallback={
      <div className={`forme ${wood.variable} ${grotesk.variable} forme-body flex items-center justify-center`}>
        <p role="status">Loading</p>
      </div>
    }>
      <AuthContent />
    </Suspense>
  );
}
