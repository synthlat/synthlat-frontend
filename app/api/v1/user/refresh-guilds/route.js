import { NextResponse } from 'next/server';
import { getUser, refreshGuilds } from '@/lib/auth';

export async function POST() {
  const user = await getUser();
  
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const success = await refreshGuilds(user.discordId);

  if (success) {
    return NextResponse.json({ success: true });
  } else {
    return NextResponse.json({ error: 'Failed to refresh guilds' }, { status: 500 });
  }
}
