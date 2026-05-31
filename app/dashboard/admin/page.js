import { redirect } from 'next/navigation';
import { getUser } from '@/lib/auth';
import { getDatabase } from '@/lib/mongodb';

const OWNER_ID = process.env.OWNER_ID;

function StatCard({ label, value }) {
  return (
    <div className="bg-white/5 border border-white/10 rounded-xl p-5">
      <div className="text-xs font-bold text-gray-400 uppercase mb-2">{label}</div>
      <div className="text-3xl font-extrabold tracking-tight">{value}</div>
    </div>
  );
}

export default async function AdminHomePage() {
  const user = await getUser();

  if (!user) redirect('/api/v1/oauth/discord');
  if (user.discordId !== OWNER_ID) redirect('/dashboard');

  const db = await getDatabase();

  const [usersCount, sessionsCount, guildsCount, bannedCount] = await Promise.all([
    db.collection('users').countDocuments(),
    db.collection('sessions').countDocuments(),
    db.collection('guilds').countDocuments(),
    db.collection('guilds').countDocuments({ 'banned.status': true })
  ]);

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <header className="mb-8 border-b border-white/10 pb-4">
        <h1 className="text-3xl font-bold mb-2">Panel de Administración</h1>
        <p className="text-gray-400">Inicio: estadísticas generales del sistema.</p>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Usuarios" value={usersCount} />
        <StatCard label="Sesiones" value={sessionsCount} />
        <StatCard label="Servidores" value={guildsCount} />
        <StatCard label="Baneados" value={bannedCount} />
      </div>

      <div className="mt-8 bg-white/5 border border-white/10 rounded-xl p-6">
        <div className="text-sm font-bold mb-2">Accesos rápidos</div>
        <ul className="text-sm text-gray-400 space-y-1">
          <li>• Publicar novedades en la sección "Novedades"</li>
          <li>• Ver y administrar servidores en la sección "Servidores"</li>
        </ul>
      </div>
    </div>
  );
}
