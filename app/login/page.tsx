import Link from 'next/link';
import { OAuthButtons } from '@/components/OAuthButtons';

export const metadata = { title: 'Login - Ravensearch' };

export default function LoginPage() {
  return (
    <main className="content-area">
      <div className="content-inner center-viewport">
        <div className="container-card">
          <h1 className="header-title">Welcome back</h1>
          <p className="header-subtitle">Sign in to access your account</p>
          <OAuthButtons />
          <div className="inline-links">
            <Link className="inline-link" href="/signup">Create account</Link>
            <Link className="inline-link" href="/">Back home</Link>
          </div>
        </div>
      </div>
    </main>
  );
}
