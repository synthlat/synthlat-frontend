import { NextResponse } from 'next/server';
import { getUser } from '@/lib/auth';
import { getDatabase } from '@/lib/mongodb';

const OWNER_ID = process.env.OWNER_ID;

function escapeRegExp(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function clampInt(value, { min, max, fallback }) {
  const n = Number.parseInt(String(value), 10);
  if (!Number.isFinite(n)) return fallback;
  return Math.min(max, Math.max(min, n));
}

export async function GET(request) {
  const user = await getUser();

  if (!user || user.discordId !== OWNER_ID) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  try {
    const db = await getDatabase();
    const { searchParams } = new URL(request.url);
    const q = (searchParams.get('q') || '').trim();
    const page = clampInt(searchParams.get('page'), { min: 1, max: 1000000, fallback: 1 });
    const limit = clampInt(searchParams.get('limit'), { min: 1, max: 20, fallback: 20 });

    const filter = q
      ? {
          $or: [
            { id: q },
            { name: { $regex: escapeRegExp(q), $options: 'i' } }
          ]
        }
      : {};

    const guildsCollection = db.collection('guilds');
    const skip = (page - 1) * limit;

    const [total, guilds] = await Promise.all([
      guildsCollection.countDocuments(filter),
      guildsCollection
        .find(filter, {
          projection: {
            _id: 0,
            id: 1,
            name: 1,
            icon_url: 1,
            bot_in_guild: 1,
            banned: 1
          }
        })
        .sort({ name: 1 })
        .skip(skip)
        .limit(limit)
        .toArray()
    ]);

    const items = guilds
      .map((g) => {
        const id = g?.id ? String(g.id) : null;
        const rawName = typeof g?.name === 'string' ? g.name.trim() : '';

        const banned = g?.banned && typeof g.banned === 'object'
          ? {
              status: !!g.banned.status,
              reason: typeof g.banned.reason === 'string' ? g.banned.reason : '',
              expires: g.banned.expires ?? null
            }
          : { status: false, reason: '', expires: null };

        return {
          id,
          name: rawName || id || 'Servidor',
          icon_url: typeof g?.icon_url === 'string' ? g.icon_url : null,
          bot_join: !!g?.bot_in_guild,
          banned
        };
      })
      .filter((g) => !!g.id);

    const totalPages = Math.max(1, Math.ceil(total / limit));
    const safePage = Math.min(page, totalPages);

    return NextResponse.json({
      items,
      page: safePage,
      pageSize: limit,
      total,
      totalPages
    });
  } catch (error) {
    console.error('Error listing guilds:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
