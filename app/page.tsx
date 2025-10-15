import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="center-viewport">
      <div className="container-card">
        <h1 className="header-title">Server is running</h1>
        <p className="header-subtitle">Now powered by Next.js on port 3000.</p>
        <div className="form-grid">
          <Link className="primary-button" href="/login">Go to Login</Link>
          <Link className="primary-button" href="/signup">Go to Sign Up</Link>
          <Link className="primary-button" href="/jobs/create">Create Job</Link>
          <Link className="primary-button" href="/technicians/signup">Technician Sign Up</Link>
        </div>
      </div>
    </main>
  );
}
