import { getDatabase } from '@/lib/mongodb';
import { randomUUID } from 'crypto';

const COLLECTION_NAME = 'news';

export async function getNews() {
  const db = await getDatabase();
  const collection = db.collection(COLLECTION_NAME);
  
  // Sort by date descending
  const docs = await collection.find({}).sort({ createdAt: -1 }).limit(10).toArray();

  // Serialize _id and dates to ensure they are plain objects
  return docs.map(doc => ({
    ...doc,
    _id: doc._id.toString(),
    createdAt: doc.createdAt instanceof Date ? doc.createdAt.toISOString() : doc.createdAt
  }));
}

export async function addNews(newsItem) {
  const db = await getDatabase();
  const collection = db.collection(COLLECTION_NAME);
  
  const newItem = {
    id: randomUUID(),
    ...newsItem,
    createdAt: new Date()
  };

  await collection.insertOne(newItem);
  
  return {
    ...newItem,
    _id: newItem._id.toString(),
    createdAt: newItem.createdAt.toISOString()
  };
}

export async function updateNews(id, updates) {
  const db = await getDatabase();
  const collection = db.collection(COLLECTION_NAME);
  
  const { _id, id: _idField, createdAt, ...data } = updates;

  await collection.updateOne(
    { id }, 
    { $set: { ...data, updatedAt: new Date() } }
  );
  
  return { id, ...updates };
}

export async function deleteNews(id) {
  const db = await getDatabase();
  const collection = db.collection(COLLECTION_NAME);
  
  await collection.deleteOne({ id });
}
