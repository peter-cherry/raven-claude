"use client";

import Link from 'next/link';
import { useAuth } from '@/components/AuthProvider';

export function HeaderElements() {
  const { user, signOut } = useAuth();

  return (
    <div className="header-elements">
      <div className="logo-section">
        <svg className="logo-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 2C10.5 2 9 3 8 4.5C7 6 6.5 8 7 10C7.5 12 9 13.5 11 14L9 22L15 18L13 14C15 13.5 16.5 12 17 10C17.5 8 17 6 16 4.5C15 3 13.5 2 12 2Z" fill="currentColor" fillOpacity="0.9"/>
        </svg>
        <span className="brand-name">RAVENSEARCH</span>
      </div>
      <div className="auth-buttons">
        {!user && (
          <>
            <Link href="/login" className="outline-button">Login</Link>
            <Link href="/signup" className="outline-button">Signup</Link>
          </>
        )}
        {user && (
          <>
            <Link href="/settings" className="outline-button">Settings</Link>
            <button onClick={signOut} className="outline-button">Logout</button>
          </>
        )}
      </div>
    </div>
  );
}
