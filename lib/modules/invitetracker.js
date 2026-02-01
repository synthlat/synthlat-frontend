import { getDatabase } from '@/lib/mongodb';

const COLLECTION_NAME = 'modules_invitetracker';

// Default configuration for the Invite Tracker module
const DEFAULT_SETTINGS = {
  enabled: false,
  channelId: null, // Channel for logs
  joinMessage: {
    content: "👋 **{user}** se ha unido al servidor.\nInvitado por: **{inviter}**\nCódigo: `{code}` ({uses} usos)",
    embeds: []
  },
  leaveMessage: {
    content: "👋 **{user}** ha salido del servidor.\nInvitado por: **{inviter}**",
    embeds: []
  }
};

async function getCollection() {
  const db = await getDatabase();
  const collection = db.collection(COLLECTION_NAME);
  
  await collection.createIndex({ guildId: 1 }, { unique: true });
  
  return collection;
}

export async function getInviteTrackerSettings(guildId) {
  const collection = await getCollection();
  const settings = await collection.findOne({ guildId });

  if (!settings) {
    return { ...DEFAULT_SETTINGS, guildId };
  }

  // Migrations
  if (!settings.joinMessage) settings.joinMessage = { ...DEFAULT_SETTINGS.joinMessage };
  if (!settings.leaveMessage) settings.leaveMessage = { ...DEFAULT_SETTINGS.leaveMessage };

  // Ensure message structure
  if (typeof settings.joinMessage === 'string') {
    settings.joinMessage = { content: settings.joinMessage, embeds: [] };
  }
  if (typeof settings.leaveMessage === 'string') {
    settings.leaveMessage = { content: settings.leaveMessage, embeds: [] };
  }

  return settings;
}

export async function updateInviteTrackerSettings(guildId, newSettings) {
  const collection = await getCollection();
  
  const { _id, ...updateData } = newSettings;

  const result = await collection.updateOne(
    { guildId },
    { $set: { ...updateData, guildId, updatedAt: new Date() } },
    { upsert: true }
  );

  return result;
}
