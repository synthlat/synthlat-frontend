import { getDatabase } from '@/lib/mongodb';

const COLLECTION_NAME = 'modules_welcome';

// Default configuration for the Welcome module
const DEFAULT_SETTINGS = {
  enabled: false,
  channelId: null,
  message: {
    content: "¡Bienvenido {user} a {server}! Esperamos que te diviertas.",
    embeds: []
  },
  roles: [] // Auto-roles to add
};

async function getCollection() {
  const db = await getDatabase();
  const collection = db.collection(COLLECTION_NAME);
  
  // Ensure index on guildId for fast lookups
  await collection.createIndex({ guildId: 1 }, { unique: true });
  
  return collection;
}

export async function getWelcomeSettings(guildId) {
  const collection = await getCollection();
  const settings = await collection.findOne({ guildId });

  if (!settings) {
    return { ...DEFAULT_SETTINGS, guildId };
  }

  // Migration logic to ensure structure consistency
  // Case 1: Old flat structure (message string + embeds array at root)
  if (typeof settings.message === 'string') {
    settings.message = {
      content: settings.message,
      embeds: settings.embeds || (settings.embed ? [settings.embed] : [])
    };
    // Clean up old root properties
    delete settings.embeds;
    delete settings.embed;
  }

  return settings;
}

export async function updateWelcomeSettings(guildId, newSettings) {
  const collection = await getCollection();
  
  const { _id, ...updateData } = newSettings;

  const result = await collection.updateOne(
    { guildId },
    { $set: { ...updateData, guildId, updatedAt: new Date() } },
    { upsert: true }
  );

  return result;
}
