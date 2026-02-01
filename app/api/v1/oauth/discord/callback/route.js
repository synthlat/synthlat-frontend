import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createSession } from '@/lib/auth';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const error = searchParams.get('error');

  // Use NEXT_PUBLIC_APP_URL for redirects to ensure correct domain
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

  if (error) {
    return NextResponse.redirect(`${appUrl}/?error=oauth_error`);
  }

  if (!code) {
    return NextResponse.redirect(`${appUrl}/?error=no_code`);
  }

  try {
    const clientId = process.env.DISCORD_CLIENT_ID;
    const clientSecret = process.env.DISCORD_CLIENT_SECRET;
    const redirectUri = `${appUrl}/api/v1/oauth/discord/callback`;

    // Exchange code for token
    const tokenResponse = await fetch('https://discord.com/api/oauth2/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        grant_type: 'authorization_code',
        code,
        redirect_uri: redirectUri,
      }),
    });

    if (!tokenResponse.ok) {
      console.error('Failed to fetch token', await tokenResponse.text());
      return NextResponse.redirect(`${appUrl}/?error=token_fetch_failed`);
    }

    const tokenData = await tokenResponse.json();
    
    // Fetch user data from Discord
    const userResponse = await fetch('https://discord.com/api/users/@me', {
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
      },
    });

    if (!userResponse.ok) {
       console.error('Failed to fetch user', await userResponse.text());
       return NextResponse.redirect(`${appUrl}/?error=user_fetch_failed`);
    }

    const userData = await userResponse.json();

    // Create session in MongoDB
    const authToken = await createSession(
      userData, 
      tokenData.access_token, 
      tokenData.refresh_token, 
      tokenData.expires_in
    );
    
    const cookieStore = await cookies();
    
    // Set secure session cookie
    cookieStore.set('auth_token', authToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: tokenData.expires_in, // Match Discord token expiration
      path: '/',
    });
    
    // Remove old cookie if exists
    cookieStore.delete('discord_access_token');
    
    return NextResponse.redirect(`${appUrl}/dashboard`);

  } catch (err) {
    console.error('OAuth error:', err);
    return NextResponse.redirect(`${appUrl}/?error=internal_error`);
  }
}
