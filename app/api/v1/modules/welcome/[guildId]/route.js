import { NextResponse } from 'next/server';
import { getWelcomeSettings, updateWelcomeSettings } from '@/lib/modules/welcome';
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
    const settings = await getWelcomeSettings(guildId);
    return NextResponse.json(settings);
  } catch (error) {
    console.error('Error fetching welcome settings:', error);
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
    
    // Basic validation could go here
    
    await updateWelcomeSettings(guildId, body);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating welcome settings:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
