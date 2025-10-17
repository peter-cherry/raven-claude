"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/components/AuthProvider';


export default function SignupPage() {
  const router = useRouter();
  const { signUp, signInWithGoogle, signInWithApple } = useAuth();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [agree, setAgree] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (password !== confirm) { setError('Passwords do not match'); return; }
    if (!agree) { setError('You must accept Terms & Conditions'); return; }
    setLoading(true);
    try {
      const defaultOrg = process.env.NEXT_PUBLIC_DEFAULT_ORG_ID;
      await signUp(fullName, email, password, defaultOrg);
      router.push('/');
    } catch (err: any) {
      setError(err.message || 'Unable to sign up');
      setLoading(false);
    }
  };

  return (
    <div className="container-card" style={{ maxWidth: 480, width: '100%' }}>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 12 }}>
        <svg className="logo-icon" viewBox="0 0 24 24" fill="currentColor" width="28" height="28"><path d="M12 2C10.5 2 9 3 8 4.5C7 6 6.5 8 7 10C7.5 12 9 13.5 11 14L9 22L15 18L13 14C15 13.5 16.5 12 17 10C17.5 8 17 6 16 4.5C15 3 13.5 2 12 2Z"/></svg>
        <h1 className="header-title" style={{ margin: 0 }}>Create account</h1>
      </div>
      <p className="header-subtitle">Join Ravensearch</p>

      <form onSubmit={onSubmit} className="form-grid" aria-label="Signup form">
        <div className="form-field">
          <label className="form-label" htmlFor="name">Full name</label>
          <input id="name" className="text-input" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
        </div>
        <div className="form-field">
          <label className="form-label" htmlFor="email">Email</label>
          <input id="email" className="text-input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>
        <div className="form-field">
          <label className="form-label" htmlFor="password">Password</label>
          <input id="password" className="text-input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </div>
        <div className="form-field">
          <label className="form-label" htmlFor="confirm">Confirm password</label>
          <input id="confirm" className="text-input" type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} required />
        </div>
        <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} />
          <span>I agree to the Terms & Conditions</span>
        </label>
        {error && <div style={{ color: 'var(--error)' }}>{error}</div>}
        <button className="primary-button" disabled={loading} type="submit" style={{ background: 'linear-gradient(90deg, #6C72C9, #8083AE)' }}>Create account</button>
      </form>

      <div className="provider-buttons">
        <button className="provider-button" onClick={signInWithGoogle} aria-label="Sign up with Google">Sign up with Google</button>
        <button className="provider-button" onClick={signInWithApple} aria-label="Sign up with Apple">Sign up with Apple</button>
      </div>

      <div className="inline-links">
        <Link className="inline-link" href="/login">Already have an account? Login</Link>
      </div>
    </div>
  );
}
