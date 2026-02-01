'use client';

import { useState, useEffect } from 'react';
import { Search, Server, ArrowRight, Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function GuildSearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (query.length < 2) {
        setResults([]);
        return;
      }

      setLoading(true);
      try {
        const res = await fetch(`/api/v1/admin/guilds/search?q=${encodeURIComponent(query)}`);
        if (res.ok) {
          const data = await res.json();
          setResults(data);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [query]);

  return (
    <div className="bg-white/5 border border-white/10 rounded-xl p-6">
      <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
        <Server size={20} className="text-blue-400" />
        Administrar Servidor
      </h2>
      
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
        <input 
          type="text" 
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar por nombre o ID..."
          className="w-full bg-black/50 border border-white/10 rounded-lg pl-10 pr-4 py-3 text-white focus:border-purple-500 focus:outline-none transition-colors"
        />
        {loading && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <Loader2 className="animate-spin text-purple-500" size={18} />
          </div>
        )}
      </div>

      <div className="space-y-2">
        {results.length > 0 ? (
          results.map((guild) => (
            <div key={guild.id} className="flex items-center justify-between bg-white/5 p-3 rounded-lg hover:bg-white/10 transition-colors group">
              <div className="flex items-center gap-3">
                <div className="relative w-10 h-10 rounded-full overflow-hidden bg-gray-800 shrink-0">
                  {guild.icon_url ? (
                    <img src={guild.icon_url} alt={guild.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-xs font-bold text-gray-500">
                      {guild.name.substring(0, 2).toUpperCase()}
                    </div>
                  )}
                </div>
                <div>
                  <div className="font-bold text-sm text-white">{guild.name}</div>
                  <div className="text-xs text-gray-500 font-mono">{guild.id}</div>
                </div>
              </div>
              <Link 
                href={`/dashboard/servers/${guild.id}`}
                className="flex items-center gap-2 px-3 py-1.5 bg-purple-600/20 text-purple-400 hover:bg-purple-600 hover:text-white rounded-lg text-xs font-bold transition-all"
              >
                Gestionar <ArrowRight size={14} />
              </Link>
            </div>
          ))
        ) : query.length >= 2 && !loading ? (
          <div className="text-center py-4 text-gray-500 text-sm">
            No se encontraron servidores.
          </div>
        ) : null}
      </div>
    </div>
  );
}
