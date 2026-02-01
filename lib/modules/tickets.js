import { getDatabase } from '@/lib/mongodb';
import { randomUUID } from 'crypto';
import { DEFAULT_PANEL as CLIENT_DEFAULT_PANEL } from './tickets-client';

const COLLECTION_NAME = 'modules_tickets';

// Re-export for server-side usage if needed, though we use the client one mostly
export const DEFAULT_PANEL = CLIENT_DEFAULT_PANEL;

const DEFAULT_SETTINGS = {
  enabled: false,
  panels: []
};

async function getCollection() {
  const db = await getDatabase();
  const collection = db.collection(COLLECTION_NAME);
  
  await collection.createIndex({ guildId: 1 }, { unique: true });
  
  return collection;
}

export async function getTicketsSettings(guildId) {
  const collection = await getCollection();
  const settings = await collection.findOne({ guildId });

  if (!settings) {
    return { ...DEFAULT_SETTINGS, guildId };
  }

  // Migration: Ensure categories have new fields
  if (settings.panels) {
    settings.panels.forEach(panel => {
      // Ensure global support roles array exists
      if (!panel.supportRoles) panel.supportRoles = [];

      if (panel.categories) {
        panel.categories.forEach(cat => {
          if (!cat.ticketMessage) {
            cat.ticketMessage = panel.ticketMessage || {
              content: "¡Hola {user}! Un miembro del staff te atenderá pronto.",
              embeds: []
            };
          }
          if (!cat.categoryId) cat.categoryId = null;
          // Ensure category specific support roles array exists
          if (!cat.supportRoles) cat.supportRoles = [];
        });
      }
    });
  }

  return settings;
}

export async function updateTicketsSettings(guildId, newSettings) {
  const collection = await getCollection();
  
  const { _id, ...updateData } = newSettings;

  const result = await collection.updateOne(
    { guildId },
    { $set: { ...updateData, guildId, updatedAt: new Date() } },
    { upsert: true }
  );

  return result;
}

export function createPanel() {
  return {
    ...DEFAULT_PANEL,
    id: randomUUID(),
    categories: [...DEFAULT_PANEL.categories.map(c => ({...c, id: randomUUID()}))]
  };
}
