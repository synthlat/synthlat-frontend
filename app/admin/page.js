import { redirect } from 'next/navigation';
import { getUser } from '@/lib/auth';
import { getNews } from '@/lib/news';
import NewsManager from './components/NewsManager';
import GuildSearch from './components/GuildSearch';

const OWNER_ID = process.env.OWNER_ID;

export default async function AdminPage() {
  const user = await getUser();

  if (!user || user.discordId !== OWNER_ID) {
    redirect('/dashboard');
  }

  const news = await getNews();

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <header className="mb-8 border-b border-white/10 pb-4">
        <h1 className="text-3xl font-bold mb-2">Panel de Administración</h1>
        <p className="text-gray-400">Bienvenido, creador. Tienes el control total.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Guild Management */}
        <div className="lg:col-span-1 space-y-8">
          <GuildSearch />
        </div>

        {/* Right Column: News Management */}
        <div className="lg:col-span-2">
          <NewsManager initialNews={news} />
        </div>
      </div>
    </div>
  );
}
