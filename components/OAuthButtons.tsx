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
      <button className="provider-button google" onClick={() => signInWith('google')} aria-label="Continue with Google">
        Continue with Google
      </button>
      <button className="provider-button apple" onClick={() => signInWith('apple')} aria-label="Continue with Apple">
        Continue with Apple
      </button>
    </div>
  );
}
