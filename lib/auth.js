import { cookies } from 'next/headers';
import { getDatabase } from './mongodb';
import { randomBytes } from 'crypto';
import { getAdminGuilds, checkBotMembership } from './discord';

export async function createSession(discordUser, accessToken, refreshToken, expiresIn) {
  const db = await getDatabase();
  const sessions = db.collection('sessions');
  const users = db.collection('users');
  const guildsCollection = db.collection('guilds');

  // 1. Fetch user's admin guilds
  const adminGuilds = await getAdminGuilds(accessToken);
  const adminGuildIds = adminGuilds.map(g => g.id);

  // 2. Process guilds to update DB
  const guildUpdates = adminGuilds.map(async (guild) => {
    const isBotInGuild = await checkBotMembership(guild.id);

    return {
      updateOne: {
        filter: { id: guild.id },
        update: {
          $set: {
            id: guild.id,
            name: guild.name,
            icon: guild.icon,
            icon_url: guild.icon ? `https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.png` : null,
            bot_in_guild: isBotInGuild,
            updatedAt: new Date()
          }
        },
        upsert: true
      }
    };
  });

  if (guildUpdates.length > 0) {
    await guildsCollection.bulkWrite(await Promise.all(guildUpdates));
  }

  // 3. Generate session token
  const authToken = randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + expiresIn * 1000);

  // 4. Update User (Persistent Data)
  await users.updateOne(
    { discordId: discordUser.id },
    { 
      $set: {
        discordId: discordUser.id,
        username: discordUser.username,
        globalName: discordUser.global_name,
        avatar: discordUser.avatar,
        avatar_url: discordUser.avatar 
          ? `https://cdn.discordapp.com/avatars/${discordUser.id}/${discordUser.avatar}.png` 
          : null,
        email: discordUser.email,
        adminGuilds: adminGuildIds, // Store IDs of guilds where user is admin
        lastLogin: new Date()
      }
    },
    { upsert: true }
  );

  // 5. Create Session Document (Minimal Data)
  await sessions.insertOne({
    authToken,
    discordId: discordUser.id,
    accessToken,
    refreshToken,
    expiresAt,
    createdAt: new Date()
  });

  return authToken;
}

export async function getSession() {
  const cookieStore = await cookies();
  const authToken = cookieStore.get('auth_token')?.value;

  if (!authToken) return null;

  const db = await getDatabase();
  const sessions = db.collection('sessions');

  const session = await sessions.findOne({ authToken });

  if (!session) return null;

  if (new Date() > session.expiresAt) {
    await sessions.deleteOne({ authToken });
    return null;
  }

  return session;
}

export async function getUser() {
  const session = await getSession();
  if (!session) return null;
  
  const db = await getDatabase();
  const users = db.collection('users');
  
  // Fetch full user data using the ID from the session
  const user = await users.findOne({ discordId: session.discordId });
  
  if (!user) return null;

  return { ...user, session };
}

export async function getUserGuilds() {
  const user = await getUser();
  if (!user) return [];

  const db = await getDatabase();
  const guildsCollection = db.collection('guilds');

  if (!user.adminGuilds || user.adminGuilds.length === 0) return [];

  return guildsCollection.find({ id: { $in: user.adminGuilds } }).toArray();
}

export async function refreshGuilds(userId) {
  const user = await getUser();
  if (!user || user.discordId !== userId) return false;

  const db = await getDatabase();
  const guildsCollection = db.collection('guilds');

  // Re-fetch admin guilds from Discord using stored access token
  // Note: This requires the access token to be valid. If expired, we'd need refresh logic.
  // For simplicity, we assume it's valid or fail gracefully.
  try {
    const adminGuilds = await getAdminGuilds(user.session.accessToken);
    const adminGuildIds = adminGuilds.map(g => g.id);

    // Update guilds in DB
    const guildUpdates = adminGuilds.map(async (guild) => {
      const isBotInGuild = await checkBotMembership(guild.id);
      return {
        updateOne: {
          filter: { id: guild.id },
          update: {
            $set: {
              id: guild.id,
              name: guild.name,
              icon: guild.icon,
              icon_url: guild.icon ? `https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.png` : null,
              bot_in_guild: isBotInGuild,
              updatedAt: new Date()
            }
          },
          upsert: true
        }
      };
    });

    if (guildUpdates.length > 0) {
      await guildsCollection.bulkWrite(await Promise.all(guildUpdates));
    }

    // Update user's adminGuilds list
    await db.collection('users').updateOne(
      { discordId: userId },
      { $set: { adminGuilds: adminGuildIds } }
    );

    return true;
  } catch (error) {
    console.error('Failed to refresh guilds:', error);
    return false;
  }
}

export async function checkGuildAccess(guildId) {
  const user = await getUser();
  if (!user) return null;

  // Bypass for Owner
  if (user.discordId === process.env.OWNER_ID) {
    return user;
  }

  if (!user.adminGuilds || !user.adminGuilds.includes(guildId)) {
    return null;
  }

  return user;
}

export async function logout() {
  const cookieStore = await cookies();
  const authToken = cookieStore.get('auth_token')?.value;

  if (authToken) {
    const db = await getDatabase();
    await db.collection('sessions').deleteOne({ authToken });
  }
  
  cookieStore.delete('auth_token');
}
