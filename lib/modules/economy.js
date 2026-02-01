import { getDatabase } from '@/lib/mongodb';

const COLLECTION_NAME = 'modules_economy';

// Default configuration for the Economy module
const DEFAULT_SETTINGS = {
  enabled: false,
  currency: {
    name: "Monedas",
    symbol: "🪙"
  },
  initialBalance: 100,
  auctions: {
    enabled: true,
    minPrice: 10,
    maxPrice: 1000000
  },
  shop: {
    enabled: true,
    items: [] // Array of { id, name, description, image, price, stock, roles: [] }
  },
  incomeRates: {
    message: 5,
    image: 9,
    reply: 5,
    cooldown: 60 // Seconds
  }
};

async function getCollection() {
  const db = await getDatabase();
  const collection = db.collection(COLLECTION_NAME);
  
  await collection.createIndex({ guildId: 1 }, { unique: true });
  
  return collection;
}

export async function getEconomySettings(guildId) {
  const collection = await getCollection();
  const settings = await collection.findOne({ guildId });

  if (!settings) {
    return { ...DEFAULT_SETTINGS, guildId };
  }

  // Migrations
  if (!settings.currency) settings.currency = { ...DEFAULT_SETTINGS.currency };
  if (!settings.auctions) settings.auctions = { ...DEFAULT_SETTINGS.auctions };
  if (!settings.shop) settings.shop = { ...DEFAULT_SETTINGS.shop };
  if (!settings.incomeRates) settings.incomeRates = { ...DEFAULT_SETTINGS.incomeRates };
  
  // Ensure items array exists and has roles array
  if (!settings.shop.items) settings.shop.items = [];
  settings.shop.items.forEach(item => {
    if (!item.roles) item.roles = [];
  });
  
  // Remove old properties if they exist (cleanup)
  if ('userCanCreateItems' in settings.shop) delete settings.shop.userCanCreateItems;
  if ('minPrice' in settings.shop) delete settings.shop.minPrice;
  if ('maxPrice' in settings.shop) delete settings.shop.maxPrice;

  return settings;
}

export async function updateEconomySettings(guildId, newSettings) {
  const collection = await getCollection();
  
  const { _id, ...updateData } = newSettings;

  const result = await collection.updateOne(
    { guildId },
    { $set: { ...updateData, guildId, updatedAt: new Date() } },
    { upsert: true }
  );

  return result;
}
