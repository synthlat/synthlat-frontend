import { NextResponse } from 'next/server';
import { getUser } from '@/lib/auth';
import { getDatabase } from '@/lib/mongodb';

const OWNER_ID = process.env.OWNER_ID;

function escapeRegExp(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export async function GET(request) {
  const user = await getUser();
  
  if (!user || user.discordId !== OWNER_ID) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q');

  if (!query || query.length < 2) {
    return NextResponse.json([]);
  }

  try {
    const db = await getDatabase();
    const safeQuery = escapeRegExp(query);
    const guilds = await db.collection('guilds')
      .find({
        $or: [
          { name: { $regex: safeQuery, $options: 'i' } },
          { id: query }
        ]
      })
      .limit(10)
      .toArray();

    return NextResponse.json(guilds);
  } catch (error) {
    console.error('Error searching guilds:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
