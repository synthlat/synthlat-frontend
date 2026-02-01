import { NextResponse } from 'next/server';
import { getLevelsSettings, updateLevelsSettings } from '@/lib/modules/levels';
import { getUser } from '@/lib/auth';

async function checkAccess(guildId) {
  const user = await getUser();
  if (!user) return null;

  if (!user.adminGuilds || !user.adminGuilds.includes(guildId)) {
    return null;
  }

  return user;
}

export async function GET(request, { params }) {
  const { guildId } = await params;
  
  const user = await checkAccess(guildId);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const settings = await getLevelsSettings(guildId);
    return NextResponse.json(settings);
  } catch (error) {
    console.error('Error fetching levels settings:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request, { params }) {
  const { guildId } = await params;
  
  const user = await checkAccess(guildId);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    
    await updateLevelsSettings(guildId, body);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating levels settings:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
