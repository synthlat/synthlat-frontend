import { NextResponse } from 'next/server';
import { getGuildChannels } from '@/lib/discord';
import { checkGuildAccess } from '@/lib/auth';

export async function GET(request, { params }) {
  const { guildId } = await params;
  
  // Security check: Ensure user has access to this guild
  const user = await checkGuildAccess(guildId);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const channels = await getGuildChannels(guildId);
    return NextResponse.json(channels);
  } catch (error) {
    console.error('Error fetching channels:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
