const DISCORD_API = 'https://discord.com/api/v10';

export async function fetchUserGuilds(accessToken) {
  const res = await fetch(`${DISCORD_API}/users/@me/guilds`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!res.ok) {
    throw new Error('Failed to fetch user guilds');
  }

  return res.json();
}

export async function checkBotMembership(guildId) {
  const botToken = process.env.DISCORD_TOKEN;
  if (!botToken) return false;

  try {
    const res = await fetch(`${DISCORD_API}/guilds/${guildId}`, {
      headers: {
        Authorization: `Bot ${botToken}`,
      },
    });
    return res.ok; // If 200, bot is in the guild. If 404/403, it's not.
  } catch (error) {
    return false;
  }
}

export async function getAdminGuilds(accessToken) {
  const guilds = await fetchUserGuilds(accessToken);
  
  // Filter: Manage Guild (0x20) or Administrator (0x8)
  // Using BigInt for bitwise operations
  return guilds.filter(g => {
    const permissions = BigInt(g.permissions);
    const MANAGE_GUILD = BigInt(0x20);
    const ADMINISTRATOR = BigInt(0x8);
    return (permissions & MANAGE_GUILD) === MANAGE_GUILD || (permissions & ADMINISTRATOR) === ADMINISTRATOR;
  });
}

export async function getGuildChannels(guildId) {
  const botToken = process.env.DISCORD_TOKEN;
  if (!botToken) return [];

  try {
    const res = await fetch(`${DISCORD_API}/guilds/${guildId}/channels`, {
      headers: {
        Authorization: `Bot ${botToken}`,
      },
    });

    if (!res.ok) return [];

    const channels = await res.json();
    
    // Filter for text (0), voice (2), category (4), announcement (5)
    return channels
      .filter(c => [0, 2, 4, 5].includes(c.type))
      .map(c => ({
        id: c.id,
        name: c.name,
        type: c.type,
        position: c.position,
        parent_id: c.parent_id // Category ID
      }))
      .sort((a, b) => {
        // Sort categories first, then by position
        if (a.type === 4 && b.type !== 4) return -1;
        if (a.type !== 4 && b.type === 4) return 1;
        return a.position - b.position;
      });
      
  } catch (error) {
    console.error('Error fetching channels:', error);
    return [];
  }
}

export async function getGuildRoles(guildId) {
  const botToken = process.env.DISCORD_TOKEN;
  if (!botToken) return [];

  try {
    const res = await fetch(`${DISCORD_API}/guilds/${guildId}/roles`, {
      headers: {
        Authorization: `Bot ${botToken}`,
      },
    });

    if (!res.ok) return [];

    const roles = await res.json();
    
    // Filter out @everyone (usually same ID as guildId) and managed roles if needed
    // Sort by position descending (highest role first)
    return roles
      .filter(r => r.name !== '@everyone')
      .map(r => ({
        id: r.id,
        name: r.name,
        color: r.color,
        position: r.position,
        permissions: r.permissions
      }))
      .sort((a, b) => b.position - a.position);
      
  } catch (error) {
    console.error('Error fetching roles:', error);
    return [];
  }
}
