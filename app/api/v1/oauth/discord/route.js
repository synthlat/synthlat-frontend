import { NextResponse } from 'next/server';

export async function GET() {
  const clientId = process.env.DISCORD_CLIENT_ID;
  const redirectUri = encodeURIComponent(`${process.env.NEXT_PUBLIC_APP_URL}/api/v1/oauth/discord/callback`);
  const scope = encodeURIComponent('identify guilds');

  if (!clientId) {
    return NextResponse.json({ error: 'Discord Client ID not configured' }, { status: 500 });
  }

  const discordLoginUrl = `https://discord.com/api/oauth2/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=${scope}`;

  return NextResponse.redirect(discordLoginUrl);
}
