'use client';

import { useEffect, useState } from 'react';
import { Users, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';

export default function ServersPage() {
  const [guilds, setGuilds] = useState([]);
  const [loading, setLoading] = useState(true);
  const searchParams = useSearchParams();
  const router = useRouter();

  const fetchGuilds = () => {
    fetch('/api/v1/user/guilds')
      .then(res => {
        if (res.status === 401) {
          window.location.href = '/api/v1/oauth/discord';
          return null;
        }
        return res.json();
      })
      .then(data => {
        if (data) setGuilds(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    const refresh = searchParams.get('refresh');
    
    if (refresh) {
      // If refresh param is present, trigger backend refresh first
      setLoading(true);
      fetch('/api/v1/user/refresh-guilds', { method: 'POST' })
        .then(() => {
          // Remove query param to clean URL
          router.replace('/dashboard/servers');
          fetchGuilds();
        })
        .catch(() => {
          fetchGuilds();
        });
    } else {
      fetchGuilds();
    }
  }, [searchParams, router]);

  if (loading) {
    return <div className="p-8 flex items-center justify-center h-full text-gray-500"><Loader2 className="animate-spin mr-2" /> Cargando servidores...</div>;
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <header className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Mis Servidores</h1>
        <p className="text-gray-400">Selecciona un servidor para configurar Synthlat.</p>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {guilds.length > 0 ? (
          guilds.map((guild) => (
            (() => {
              const name = typeof guild?.name === 'string' && guild.name.trim() ? guild.name : (guild?.id ? String(guild.id) : 'Servidor');
              const initials = name.substring(0, 2).toUpperCase();

              return (
            <div key={guild.id} className="group bg-white/5 border border-white/10 rounded-xl p-4 hover:border-purple-500/50 transition-all hover:-translate-y-1">
              <div className="flex items-center gap-4 mb-4">
                <div className="relative w-14 h-14 rounded-full bg-gray-800 shrink-0 overflow-hidden border border-white/10 group-hover:border-purple-500 transition-colors">
                  {guild.icon_url ? (
                    <img 
                      src={guild.icon_url} 
                      alt={name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-xl font-bold text-gray-500">
                      {initials}
                    </div>
                  )}
                </div>
                <div className="overflow-hidden">
                  <h3 className="font-bold truncate group-hover:text-purple-400 transition-colors">{name}</h3>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-400">Administrador</span>
                    {guild.bot_join && (
                      <span className="text-[10px] bg-purple-500/20 text-purple-300 px-1.5 py-0.5 rounded">Bot Agregado</span>
                    )}
                  </div>
                </div>
              </div>
              
              {guild.bot_join ? (
                <Link 
                  href={`/dashboard/servers/${guild.id}`}
                  className="block w-full py-2 bg-white/10 hover:bg-purple-600 hover:text-white rounded-lg font-medium text-sm transition-all text-center"
                >
                  Gestionar
                </Link>
              ) : (
                <a 
                  href={`https://discord.com/oauth2/authorize?client_id=${process.env.NEXT_PUBLIC_DISCORD_CLIENT_ID}&permissions=8&response_type=code&redirect_uri=${encodeURIComponent(`${process.env.NEXT_PUBLIC_APP_URL}/dashboard/servers?refresh=true`)}&integration_type=0&scope=identify+bot&guild_id=${guild.id}`}
                  className="block w-full py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium text-sm transition-all text-center shadow-[0_0_15px_rgba(147,51,234,0.3)]"
                >
                  Invitar Bot
                </a>
              )}
            </div>
              );
            })()
          ))
        ) : (
          <div className="col-span-full text-center py-12 bg-white/5 rounded-xl border border-white/10 border-dashed">
            <Users className="w-12 h-12 text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No se encontraron servidores</h3>
            <p className="text-gray-400 max-w-md mx-auto">
              Parece que no tienes permisos de administrador en ningún servidor.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
