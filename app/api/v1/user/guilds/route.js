import { NextResponse } from 'next/server';
import { getUserGuilds, getUser } from '@/lib/auth';

export async function GET() {
  const session = await getUser();
  
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const guilds = await getUserGuilds();

  // Map to the requested format
  const formattedGuilds = guilds
    .map((g) => {
      const id = g?.id ? String(g.id) : null;
      const rawName = typeof g?.name === 'string' ? g.name.trim() : '';

      return {
        id,
        name: rawName || id || 'Servidor',
        icon_url: typeof g?.icon_url === 'string' ? g.icon_url : null,
        bot_join: !!g?.bot_in_guild
      };
    })
    .filter((g) => !!g.id);

  return NextResponse.json(formattedGuilds);
}
