import { NextResponse } from 'next/server';
import { getLevelsSettings, updateLevelsSettings } from '@/lib/modules/levels';
import { checkGuildAccess } from '@/lib/auth';

export async function GET(request, { params }) {
  const { guildId } = await params;
  
  const user = await checkGuildAccess(guildId);
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
  
  const user = await checkGuildAccess(guildId);
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
