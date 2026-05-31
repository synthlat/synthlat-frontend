import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { randomBytes } from 'crypto';

export async function GET() {
  const clientId = process.env.DISCORD_CLIENT_ID;
  const redirectUri = encodeURIComponent(`${process.env.NEXT_PUBLIC_APP_URL}/api/v1/oauth/discord/callback`);
  const scope = encodeURIComponent('identify guilds');

  if (!clientId) {
    return NextResponse.json({ error: 'Discord Client ID not configured' }, { status: 500 });
  }

  // CSRF protection for OAuth (state)
  const state = randomBytes(16).toString('hex');
  const cookieStore = await cookies();
  cookieStore.set('oauth_state', state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 10, // 10 minutes
    path: '/',
  });

  const discordLoginUrl = `https://discord.com/api/oauth2/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=${scope}&state=${state}`;

  return NextResponse.redirect(discordLoginUrl);
}
