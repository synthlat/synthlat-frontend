import { NextResponse } from 'next/server';
import { getTicketsSettings, updateTicketsSettings } from '@/lib/modules/tickets';
import { checkGuildAccess } from '@/lib/auth';

export async function GET(request, { params }) {
  const { guildId } = await params;
  
  const user = await checkGuildAccess(guildId);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const settings = await getTicketsSettings(guildId);
    return NextResponse.json(settings);
  } catch (error) {
    console.error('Error fetching tickets settings:', error);
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
    
    // Basic validation
    if (body.panels && body.panels.length > 8) {
      return NextResponse.json({ error: 'Max 8 panels allowed' }, { status: 400 });
    }

    await updateTicketsSettings(guildId, body);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating tickets settings:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
