import { NextResponse } from 'next/server';
import { getByeSettings, updateByeSettings } from '@/lib/modules/bye';
import { getUser } from '@/lib/auth';

// Middleware-like check for guild access
async function checkAccess(guildId) {
  const user = await getUser();
  if (!user) return null;

  // Check if user is admin of this guild
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
    const settings = await getByeSettings(guildId);
    return NextResponse.json(settings);
  } catch (error) {
    console.error('Error fetching bye settings:', error);
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
    
    await updateByeSettings(guildId, body);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating bye settings:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
