import { NextResponse } from 'next/server';
import { checkGuildAccess } from '@/lib/auth';
import { getWelcomeSettings } from '@/lib/modules/welcome';
import { getByeSettings } from '@/lib/modules/bye';
import { getInviteTrackerSettings } from '@/lib/modules/invitetracker';
import { getEconomySettings } from '@/lib/modules/economy';
import { getLevelsSettings } from '@/lib/modules/levels';
import { getTicketsSettings } from '@/lib/modules/tickets';
import { getReportsSettings } from '@/lib/modules/reports';
import { getTempVoiceSettings } from '@/lib/modules/tempvoice';

export async function GET(request, { params }) {
  const { guildId } = await params;
  
  const user = await checkGuildAccess(guildId);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Fetch all settings in parallel
    const [
      welcome,
      bye,
      invitetracker,
      economy,
      levels,
      tickets,
      reports,
      tempvoice
    ] = await Promise.all([
      getWelcomeSettings(guildId),
      getByeSettings(guildId),
      getInviteTrackerSettings(guildId),
      getEconomySettings(guildId),
      getLevelsSettings(guildId),
      getTicketsSettings(guildId),
      getReportsSettings(guildId),
      getTempVoiceSettings(guildId)
    ]);

    const modules = {
      welcome: welcome.enabled,
      bye: bye.enabled,
      invitetracker: invitetracker.enabled,
      economy: economy.enabled,
      levels: levels.enabled,
      tickets: tickets.enabled,
      reports: reports.enabled,
      tempvoice: tempvoice.enabled
    };

    return NextResponse.json(modules);
  } catch (error) {
    console.error('Error fetching modules status:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
