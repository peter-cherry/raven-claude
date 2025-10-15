import Link from 'next/link';
import { OAuthButtons } from '@/components/OAuthButtons';

export const metadata = { title: 'Sign up - Ravensearch' };

export default function SignupPage() {
  return (
    <main className="content-area">
      <div className="content-inner center-viewport">
        <div className="container-card">
          <h1 className="header-title">Get started</h1>
          <p className="header-subtitle">Create your Ravensearch account</p>
          <OAuthButtons />
          <div className="inline-links">
            <Link className="inline-link" href="/login">Already have an account?</Link>
            <Link className="inline-link" href="/">Back home</Link>
          </div>
        </div>
      </div>
    </main>
  );
}
