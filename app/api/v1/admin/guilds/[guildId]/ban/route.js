import { NextResponse } from 'next/server';
import { getUser } from '@/lib/auth';
import { getDatabase } from '@/lib/mongodb';

const OWNER_ID = process.env.OWNER_ID;

function parseExpires(value) {
  if (value === null || value === undefined || value === '') return null;
  if (typeof value !== 'string') return null;

  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  return d;
}

export async function POST(request, { params }) {
  const { guildId } = await params;

  const user = await getUser();
  if (!user || user.discordId !== OWNER_ID) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const status = !!body?.status;
  const reason = typeof body?.reason === 'string' ? body.reason.slice(0, 500) : '';
  const expires = status ? parseExpires(body?.expires) : null;

  try {
    const db = await getDatabase();
    const guilds = db.collection('guilds');

    if (!status) {
      await guilds.updateOne(
        { id: String(guildId) },
        { $unset: { banned: '' }, $set: { updatedAt: new Date() } },
        { upsert: true }
      );
      return NextResponse.json({ success: true });
    }

    await guilds.updateOne(
      { id: String(guildId) },
      {
        $set: {
          banned: {
            status: true,
            reason,
            expires
          },
          updatedAt: new Date()
        }
      },
      { upsert: true }
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating guild ban:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
