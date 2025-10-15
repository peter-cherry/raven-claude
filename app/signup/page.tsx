import Link from 'next/link';
import { OAuthButtons } from '@/components/OAuthButtons';

export const metadata = { title: 'Sign up' };

export default function SignupPage() {
  return (
    <main className="center-viewport">
      <div className="container-card">
        <h1 className="header-title">Sign up</h1>
        <p className="header-subtitle">Create a new account</p>
        <OAuthButtons />
        <div className="inline-links">
          <Link className="inline-link" href="/login">Already have an account?</Link>
          <Link className="inline-link" href="/">Back home</Link>
        </div>
      </div>
    </main>
  );
}
