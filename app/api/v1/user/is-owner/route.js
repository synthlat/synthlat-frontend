import { NextResponse } from 'next/server';
import { getUser } from '@/lib/auth';

const OWNER_ID = process.env.OWNER_ID;

export async function GET() {
  const user = await getUser();
  
  if (!user) {
    return NextResponse.json({ isOwner: false });
  }

  return NextResponse.json({ isOwner: user.discordId === OWNER_ID });
}
