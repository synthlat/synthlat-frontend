import { redirect } from 'next/navigation';
import { getUser } from '@/lib/auth';
import { getNews } from '@/lib/news';
import NewsManager from '../components/NewsManager';

const OWNER_ID = process.env.OWNER_ID;

export default async function AdminNewsPage() {
  const user = await getUser();

  if (!user) redirect('/api/v1/oauth/discord');
  if (user.discordId !== OWNER_ID) redirect('/dashboard');

  const news = await getNews();

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <header className="mb-8 border-b border-white/10 pb-4">
        <h1 className="text-3xl font-bold mb-2">Novedades</h1>
        <p className="text-gray-400">Publica y edita noticias visibles para los usuarios.</p>
      </header>

      <NewsManager initialNews={news} />
    </div>
  );
}
