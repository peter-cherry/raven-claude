import Link from 'next/link';
import { OAuthButtons } from '@/components/OAuthButtons';

export const metadata = { title: 'Login' };

export default function LoginPage() {
  return (
    <main className="center-viewport">
      <div className="container-card">
        <h1 className="header-title">Log in</h1>
        <p className="header-subtitle">Access your account</p>
        <OAuthButtons />
        <div className="inline-links">
          <Link className="inline-link" href="/signup">Create account</Link>
          <Link className="inline-link" href="/">Back home</Link>
        </div>
      </div>
    </main>
  );
}
