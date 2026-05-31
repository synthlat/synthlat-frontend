import { NextResponse } from 'next/server';
import { getInviteTrackerSettings, updateInviteTrackerSettings } from '@/lib/modules/invitetracker';
import { checkGuildAccess } from '@/lib/auth';

export async function GET(request, { params }) {
  const { guildId } = await params;
  
  const user = await checkGuildAccess(guildId);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const settings = await getInviteTrackerSettings(guildId);
    return NextResponse.json(settings);
  } catch (error) {
    console.error('Error fetching invitetracker settings:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request, { params }) {
  const { guildId } = await params;
  
  const user = await checkGuildAccess(guildId);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    
    await updateInviteTrackerSettings(guildId, body);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating invitetracker settings:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
