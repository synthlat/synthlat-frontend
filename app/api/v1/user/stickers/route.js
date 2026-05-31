import { NextResponse } from 'next/server';
import { getUser } from '@/lib/auth';
import { getDatabase } from '@/lib/mongodb';
import { randomUUID } from 'crypto';

export async function GET() {
  const user = await getUser();
  
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Check vote status (mocked for now, assume true or check DB)
  // In a real app, you'd check a 'votes' collection or external API
  const hasVoted = true; // Placeholder

  return NextResponse.json({
    stickers: user.stickers || [],
    tosAccepted: !!user.tosAccepted,
    hasVoted
  });
}

export async function POST(request) {
  const user = await getUser();
  
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!user.tosAccepted) {
    return NextResponse.json({ error: 'ToS not accepted' }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { name, url } = body;

    if (!name || !url) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }

    // Basic validation: only allow http(s) URLs
    let parsed;
    try {
      parsed = new URL(url);
    } catch {
      return NextResponse.json({ error: 'Invalid URL' }, { status: 400 });
    }
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      return NextResponse.json({ error: 'Invalid URL protocol' }, { status: 400 });
    }
    if (url.length > 2048) {
      return NextResponse.json({ error: 'URL too long' }, { status: 400 });
    }

    const currentStickers = user.stickers || [];
    if (currentStickers.length >= 15) {
      return NextResponse.json({ error: 'Limit reached' }, { status: 400 });
    }

    const newSticker = {
      id: randomUUID(),
      name,
      url,
      createdAt: new Date()
    };

    const db = await getDatabase();
    await db.collection('users').updateOne(
      { discordId: user.discordId },
      { $push: { stickers: newSticker } }
    );

    return NextResponse.json(newSticker);
  } catch (error) {
    console.error('Error adding sticker:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(request) {
  const user = await getUser();
  
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Missing ID' }, { status: 400 });
    }

    const db = await getDatabase();
    await db.collection('users').updateOne(
      { discordId: user.discordId },
      { $pull: { stickers: { id } } }
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting sticker:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
