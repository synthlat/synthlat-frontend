import { NextResponse } from 'next/server';
import { getUserGuilds, getUser } from '@/lib/auth';

export async function GET() {
  const session = await getUser();
  
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const guilds = await getUserGuilds();

  // Map to the requested format
  const formattedGuilds = guilds.map(g => ({
    id: g.id,
    name: g.name,
    icon_url: g.icon_url,
    bot_join: g.bot_in_guild
  }));

  return NextResponse.json(formattedGuilds);
}
