import { NextResponse } from 'next/server';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });
  // This will refresh session if needed and set auth cookies on responses
  await supabase.auth.getSession();
  return res;
}

export const config = {
  matcher: ['/((?!_next|static|.*\\.\w+$).*)'],
};
