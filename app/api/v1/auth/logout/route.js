import { NextResponse } from 'next/server';
import { logout } from '@/lib/auth';

export async function POST(request) {
  await logout();
  return NextResponse.redirect(new URL('/', request.url));
}
