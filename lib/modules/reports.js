import { getDatabase } from '@/lib/mongodb';
import { encrypt, decrypt } from '@/lib/crypto';

const COLLECTION_NAME = 'modules_reports';

// Default configuration for the Reports module
const DEFAULT_SETTINGS = {
  enabled: false,
  channelId: null, // Channel where reports are sent
  adminRoles: [], // Roles that can manage reports
  allowAdminReports: false, // Allow reporting administrators
  punishment: {
    type: 'none', // none, timeout, kick, ban
    duration: 60, // in minutes (for timeout/ban), 0 for perma ban
  },
  ai: {
    enabled: false,
    confidenceThreshold: 80, // Minimum confidence % to auto-approve
    contextPrompt: "El usuario {username} esta siendo activamente toxico y de ninguna forma es lenguaje coloquial",
    apiKey: null // Encrypted Gemini API Key
  }
};

async function getCollection() {
  const db = await getDatabase();
  const collection = db.collection(COLLECTION_NAME);
  
  // Ensure index on guildId for fast lookups
  await collection.createIndex({ guildId: 1 }, { unique: true });
  
  return collection;
}

export async function getReportsSettings(guildId) {
  const collection = await getCollection();
  const settings = await collection.findOne({ guildId });

  if (!settings) {
    return { ...DEFAULT_SETTINGS, guildId };
  }

  // Ensure structure consistency (migrations)
  if (!settings.ai) settings.ai = { ...DEFAULT_SETTINGS.ai };
  if (!settings.ai.contextPrompt) settings.ai.contextPrompt = DEFAULT_SETTINGS.ai.contextPrompt;
  if (!settings.punishment) settings.punishment = { ...DEFAULT_SETTINGS.punishment };

  // Decrypt API Key for internal use if needed, but usually we send it masked to frontend
  if (settings.ai.apiKey) {
    settings.ai.hasApiKey = true;
    settings.ai.apiKey = null; 
  } else {
    settings.ai.hasApiKey = false;
  }

  return settings;
}

export async function updateReportsSettings(guildId, newSettings) {
  const collection = await getCollection();
  
  const updatePayload = { ...newSettings };
  
  if (updatePayload.ai && updatePayload.ai.apiKey) {
    updatePayload.ai.apiKey = encrypt(updatePayload.ai.apiKey);
  } else if (updatePayload.ai && updatePayload.ai.apiKey === "") {
     updatePayload.ai.apiKey = null;
  } else if (updatePayload.ai && updatePayload.ai.apiKey === null && updatePayload.ai.hasApiKey) {
    const existing = await collection.findOne({ guildId });
    if (existing && existing.ai && existing.ai.apiKey) {
      updatePayload.ai.apiKey = existing.ai.apiKey;
    }
  }

  if (updatePayload.ai) delete updatePayload.ai.hasApiKey;
  
  const { _id, ...updateData } = updatePayload;

  const result = await collection.updateOne(
    { guildId },
    { $set: { ...updateData, guildId, updatedAt: new Date() } },
    { upsert: true }
  );

  return result;
}

export async function getDecryptedApiKey(guildId) {
  const collection = await getCollection();
  const settings = await collection.findOne({ guildId });
  
  if (settings && settings.ai && settings.ai.apiKey) {
    try {
      return decrypt(settings.ai.apiKey);
    } catch (e) {
      console.error("Failed to decrypt API key for guild", guildId);
      return null;
    }
  }
  return null;
}
