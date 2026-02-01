import { getDatabase } from '@/lib/mongodb';

const COLLECTION_NAME = 'guilds';

const DEFAULT_SETTINGS = {
  prefix: "!",
  language: "es",
  timezone: "UTC"
};

async function getCollection() {
  const db = await getDatabase();
  return db.collection(COLLECTION_NAME);
}

export async function getGuildSettings(guildId) {
  const collection = await getCollection();
  const guild = await collection.findOne({ id: guildId });

  if (!guild || !guild.settings) {
    return { ...DEFAULT_SETTINGS };
  }

  return { ...DEFAULT_SETTINGS, ...guild.settings };
}

export async function updateGuildSettings(guildId, newSettings) {
  const collection = await getCollection();
  
  const result = await collection.updateOne(
    { id: guildId },
    { $set: { settings: newSettings, updatedAt: new Date() } },
    { upsert: true }
  );

  return result;
}
