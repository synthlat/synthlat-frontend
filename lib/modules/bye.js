import { getDatabase } from '@/lib/mongodb';

const COLLECTION_NAME = 'modules_bye';

// Default configuration for the Bye module
const DEFAULT_SETTINGS = {
  enabled: false,
  channelId: null,
  message: {
    content: "{user} ha abandonado el servidor. ¡Esperamos verte pronto!",
    embeds: []
  }
};

async function getCollection() {
  const db = await getDatabase();
  const collection = db.collection(COLLECTION_NAME);
  
  // Ensure index on guildId for fast lookups
  await collection.createIndex({ guildId: 1 }, { unique: true });
  
  return collection;
}

export async function getByeSettings(guildId) {
  const collection = await getCollection();
  const settings = await collection.findOne({ guildId });

  if (!settings) {
    return { ...DEFAULT_SETTINGS, guildId };
  }

  // Migration logic if needed (similar to welcome module)
  if (typeof settings.message === 'string') {
    settings.message = {
      content: settings.message,
      embeds: settings.embeds || []
    };
    delete settings.embeds;
  }

  return settings;
}

export async function updateByeSettings(guildId, newSettings) {
  const collection = await getCollection();
  
  const { _id, ...updateData } = newSettings;

  const result = await collection.updateOne(
    { guildId },
    { $set: { ...updateData, guildId, updatedAt: new Date() } },
    { upsert: true }
  );

  return result;
}
