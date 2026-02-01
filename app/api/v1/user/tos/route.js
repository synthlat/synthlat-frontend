import { NextResponse } from 'next/server';
import { getUser } from '@/lib/auth';
import { getDatabase } from '@/lib/mongodb';

export async function POST(request) {
  const user = await getUser();
  
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const db = await getDatabase();
    await db.collection('users').updateOne(
      { discordId: user.discordId },
      { $set: { tosAccepted: true, tosAcceptedAt: new Date() } }
    );
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error accepting ToS:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
