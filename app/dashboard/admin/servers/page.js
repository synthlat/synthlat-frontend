import { redirect } from 'next/navigation';
import { getUser } from '@/lib/auth';
import ServersManager from '../components/ServersManager';

const OWNER_ID = process.env.OWNER_ID;

export default async function AdminServersPage() {
  const user = await getUser();

  if (!user) redirect('/api/v1/oauth/discord');
  if (user.discordId !== OWNER_ID) redirect('/dashboard');

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8">
      <header className="border-b border-white/10 pb-4">
        <h1 className="text-3xl font-bold mb-2">Servidores</h1>
        <p className="text-gray-400">Editar cualquier servidor y gestionar baneos.</p>
      </header>

      <ServersManager />
    </div>
  );
}
