import { NextResponse } from 'next/server';
import { checkGuildAccess } from '@/lib/auth';
import { getDatabase } from '@/lib/mongodb';

export async function GET(request, { params }) {
  const { guildId } = await params;

  const user = await checkGuildAccess(guildId);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const db = await getDatabase();
    const guild = await db.collection('guilds').findOne(
      { id: String(guildId) },
      {
        projection: {
          _id: 0,
          id: 1,
          name: 1,
          icon_url: 1,
          bot_in_guild: 1
        }
      }
    );

    if (!guild) {
      // Owner can open arbitrary guild IDs even if not yet in DB.
      if (user.discordId === process.env.OWNER_ID) {
        return NextResponse.json({
          id: String(guildId),
          name: String(guildId),
          icon_url: null,
          bot_join: false
        });
      }

      return NextResponse.json({ error: 'Not Found' }, { status: 404 });
    }

    const safeName = typeof guild.name === 'string' && guild.name.trim() ? guild.name.trim() : String(guildId);

    return NextResponse.json({
      id: String(guild.id),
      name: safeName,
      icon_url: typeof guild.icon_url === 'string' ? guild.icon_url : null,
      bot_join: !!guild.bot_in_guild
    });
  } catch (error) {
    console.error('Error fetching guild summary:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
