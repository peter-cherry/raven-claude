"use client";

import * as React from 'react';
import { supabase } from '@/lib/supabaseClient';

type Provider = 'google' | 'apple';

async function signInWith(provider: Provider) {
  const redirectTo = typeof window !== 'undefined' ? window.location.origin : undefined;
  await supabase.auth.signInWithOAuth({ provider, options: { redirectTo } });
}

export function OAuthButtons() {
  return (
    <div className="provider-buttons">
      <button className="provider-button" onClick={() => signInWith('google')} aria-label="Continue with Google">
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z" fill="#4285F4"/>
          <path d="M9.003 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.96v2.332C2.44 15.983 5.485 18 9.003 18z" fill="#34A853"/>
          <path d="M3.964 10.712c-.18-.54-.282-1.117-.282-1.71 0-.593.102-1.17.282-1.71V4.96H.957C.347 6.175 0 7.55 0 9.002c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
          <path d="M9.003 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.464.891 11.426 0 9.002 0 5.485 0 2.44 2.017.96 4.958L3.967 7.29c.708-2.127 2.692-3.71 5.036-3.71z" fill="#EA4335"/>
        </svg>
        Continue with Google
      </button>
      <button className="provider-button" onClick={() => signInWith('apple')} aria-label="Continue with Apple">
        <svg width="18" height="18" viewBox="0 0 18 18" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
          <path d="M14.94 13.13c-.26.58-.56 1.12-.9 1.63-.48.71-.87 1.2-1.17 1.48-.46.43-1 .65-1.58.66-.4 0-.89-.11-1.46-.35-.57-.23-1.1-.34-1.58-.34-.5 0-1.04.11-1.62.34-.58.24-1.04.36-1.39.38-.57.03-1.12-.2-1.64-.68-.33-.3-.73-.81-1.22-1.54-.53-.77-.96-1.66-1.29-2.68C.37 10.68.2 9.36.2 8.09c0-1.48.32-2.76.96-3.82.64-1.06 1.49-1.59 2.55-1.59.5 0 1.16.16 1.97.46.81.31 1.33.46 1.56.46.17 0 .75-.18 1.74-.54.94-.33 1.73-.47 2.38-.42 1.76.14 3.08.84 3.96 2.1-1.57.95-2.35 2.29-2.33 4 .01 1.33.5 2.44 1.45 3.32.43.41.91.73 1.45.96-.12.34-.24.66-.37.98zm-3.2-14.93c0 1.04-.38 2.01-1.14 2.91-.92 1.07-2.03 1.69-3.24 1.59-.02-.13-.02-.26-.02-.4 0-1 .44-2.07 1.21-2.95.39-.45.88-.82 1.47-1.13.59-.3 1.15-.47 1.68-.51.01.16.02.32.02.48z"/>
        </svg>
        Continue with Apple
      </button>
    </div>
  );
}
