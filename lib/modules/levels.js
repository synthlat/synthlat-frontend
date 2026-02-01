import { getDatabase } from '@/lib/mongodb';

const COLLECTION_NAME = 'modules_levels';

// Default configuration for the Levels module
const DEFAULT_SETTINGS = {
  enabled: false,
  // XP Gain Rates (per action)
  xpRates: {
    message: 15,      // XP per text message
    image: 25,        // XP per image/attachment
    reply: 20,        // XP per reply
    cooldown: 60      // Seconds between XP gains (anti-spam)
  },
  // Leveling Curve
  curve: {
    base: 100,        // XP needed for level 1
    multiplier: 1.5   // Growth factor (Requirement = Base * (CurrentLevel * Multiplier))
  },
  // Notification Settings
  notification: {
    type: 'current', // 'current', 'channel', 'dm', 'none'
    channelId: null, // Specific channel ID if type is 'channel'
    message: {
      content: "¡Felicidades {user}! Has subido al nivel **{level}** 🎉",
      embeds: []
    }
  }
};

async function getCollection() {
  const db = await getDatabase();
  const collection = db.collection(COLLECTION_NAME);
  
  await collection.createIndex({ guildId: 1 }, { unique: true });
  
  return collection;
}

export async function getLevelsSettings(guildId) {
  const collection = await getCollection();
  const settings = await collection.findOne({ guildId });

  if (!settings) {
    return { ...DEFAULT_SETTINGS, guildId };
  }

  // Migrations / Defaults assurance
  if (!settings.xpRates) settings.xpRates = { ...DEFAULT_SETTINGS.xpRates };
  if (!settings.curve) settings.curve = { ...DEFAULT_SETTINGS.curve };
  if (!settings.notification) settings.notification = { ...DEFAULT_SETTINGS.notification };
  
  // Ensure message structure
  if (typeof settings.notification.message === 'string') {
    settings.notification.message = {
      content: settings.notification.message,
      embeds: []
    };
  }

  return settings;
}

export async function updateLevelsSettings(guildId, newSettings) {
  const collection = await getCollection();
  
  const { _id, ...updateData } = newSettings;

  const result = await collection.updateOne(
    { guildId },
    { $set: { ...updateData, guildId, updatedAt: new Date() } },
    { upsert: true }
  );

  return result;
}
