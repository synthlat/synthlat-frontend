import { NextResponse } from 'next/server';
import { getGuildRoles } from '@/lib/discord';
import { checkGuildAccess } from '@/lib/auth';

export async function GET(request, { params }) {
  const { guildId } = await params;
  
  // Security check: Ensure user has access to this guild
  const user = await checkGuildAccess(guildId);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const roles = await getGuildRoles(guildId);
    return NextResponse.json(roles);
  } catch (error) {
    console.error('Error fetching roles:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
