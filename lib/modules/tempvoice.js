import { getDatabase } from '@/lib/mongodb';

const COLLECTION_NAME = 'modules_tempvoice';

// Default configuration for the Temp Voice module
const DEFAULT_SETTINGS = {
  enabled: false,
  channelId: null, // The "Join to Create" voice channel ID
  categoryId: null, // Category where temp channels will be created
  defaultLimit: 0, // 0 = unlimited
  channelName: "{user}'s Channel", // Template for channel name
  allowedRoles: [], // Roles that can create channels (empty = everyone)
};

async function getCollection() {
  const db = await getDatabase();
  const collection = db.collection(COLLECTION_NAME);
  
  await collection.createIndex({ guildId: 1 }, { unique: true });
  
  return collection;
}

export async function getTempVoiceSettings(guildId) {
  const collection = await getCollection();
  const settings = await collection.findOne({ guildId });

  if (!settings) {
    return { ...DEFAULT_SETTINGS, guildId };
  }

  return settings;
}

export async function updateTempVoiceSettings(guildId, newSettings) {
  const collection = await getCollection();
  
  const { _id, ...updateData } = newSettings;

  const result = await collection.updateOne(
    { guildId },
    { $set: { ...updateData, guildId, updatedAt: new Date() } },
    { upsert: true }
  );

  return result;
}
