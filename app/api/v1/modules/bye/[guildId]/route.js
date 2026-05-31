import { NextResponse } from 'next/server';
import { getByeSettings, updateByeSettings } from '@/lib/modules/bye';
import { checkGuildAccess } from '@/lib/auth';

export async function GET(request, { params }) {
  const { guildId } = await params;
  
  const user = await checkGuildAccess(guildId);
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
  
  const user = await checkGuildAccess(guildId);
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
