import { NextResponse } from 'next/server';
import { getNews, addNews, updateNews, deleteNews } from '@/lib/news';
import { getUser } from '@/lib/auth';

const OWNER_ID = process.env.OWNER_ID;

export async function GET() {
  try {
    const news = await getNews();
    return NextResponse.json(news);
  } catch (error) {
    console.error('Error fetching news:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request) {
  const user = await getUser();
  
  if (!user || user.discordId !== OWNER_ID) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  try {
    const body = await request.json();
    const newItem = await addNews(body);
    return NextResponse.json(newItem);
  } catch (error) {
    console.error('Error adding news:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PUT(request) {
  const user = await getUser();
  
  if (!user || user.discordId !== OWNER_ID) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { id, ...updates } = body;
    
    if (!id) return NextResponse.json({ error: 'Missing ID' }, { status: 400 });

    const updatedItem = await updateNews(id, updates);
    return NextResponse.json(updatedItem);
  } catch (error) {
    console.error('Error updating news:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(request) {
  const user = await getUser();
  
  if (!user || user.discordId !== OWNER_ID) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) return NextResponse.json({ error: 'Missing ID' }, { status: 400 });

    await deleteNews(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting news:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
