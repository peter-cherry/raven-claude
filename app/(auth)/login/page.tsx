"use client";

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/components/AuthProvider';

export const metadata = { title: 'Login' };

export default function LoginPage() {
  const { signIn, signInWithGoogle, signInWithApple } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await signIn(email, password);
    } catch (err: any) {
      setError(err.message || 'Unable to sign in');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-card" style={{ maxWidth: 440, width: '100%' }}>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 12 }}>
        <svg className="logo-icon" viewBox="0 0 24 24" fill="currentColor" width="28" height="28"><path d="M12 2C10.5 2 9 3 8 4.5C7 6 6.5 8 7 10C7.5 12 9 13.5 11 14L9 22L15 18L13 14C15 13.5 16.5 12 17 10C17.5 8 17 6 16 4.5C15 3 13.5 2 12 2Z"/></svg>
        <h1 className="header-title" style={{ margin: 0 }}>Sign in</h1>
      </div>
      <p className="header-subtitle">Welcome back. Continue to Ravensearch.</p>

      <form onSubmit={onSubmit} className="form-grid" aria-label="Login form">
        <div className="form-field">
          <label className="form-label" htmlFor="email">Email</label>
          <input id="email" className="text-input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>
        <div className="form-field">
          <label className="form-label" htmlFor="password">Password</label>
          <input id="password" className="text-input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </div>
        {error && <div style={{ color: 'var(--error)' }}>{error}</div>}
        <button className="primary-button" disabled={loading} type="submit" style={{ background: 'linear-gradient(90deg, #6C72C9, #8083AE)' }}>Sign in</button>
      </form>

      <div className="provider-buttons">
        <button className="provider-button" onClick={signInWithGoogle} aria-label="Sign in with Google">Sign in with Google</button>
        <button className="provider-button" onClick={signInWithApple} aria-label="Sign in with Apple">Sign in with Apple</button>
      </div>

      <div className="inline-links">
        <Link className="inline-link" href="/signup">Don't have an account? Sign up</Link>
      </div>
    </div>
  );
}
