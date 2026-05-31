'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Loader2, Ban, CheckCircle2, ExternalLink, RefreshCw, Search } from 'lucide-react';

function formatDate(value) {
  if (!value) return 'Permanente';
  try {
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return 'Permanente';
    return d.toLocaleString();
  } catch {
    return 'Permanente';
  }
}

export default function ServersManager() {
  const [guilds, setGuilds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState(null);
  const [query, setQuery] = useState('');
  const [expandedId, setExpandedId] = useState(null);

  const [reasonById, setReasonById] = useState({});
  const [expiresById, setExpiresById] = useState({});
  const [permanentById, setPermanentById] = useState({});

  const load = () => {
    setLoading(true);
    fetch('/api/v1/admin/guilds/list')
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => {
        setGuilds(Array.isArray(data) ? data : []);

        // Seed form state
        const nextReason = {};
        const nextExpires = {};
        const nextPermanent = {};
        for (const g of Array.isArray(data) ? data : []) {
          const banned = g?.banned;
          nextReason[g.id] = banned?.reason || '';
          nextExpires[g.id] = banned?.expires ? new Date(banned.expires).toISOString().slice(0, 16) : '';
          nextPermanent[g.id] = !banned?.expires;
        }
        setReasonById(nextReason);
        setExpiresById(nextExpires);
        setPermanentById(nextPermanent);
      })
      .catch(() => setGuilds([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const sortedGuilds = useMemo(() => {
    return [...guilds].sort((a, b) => String(a.name || '').localeCompare(String(b.name || '')));
  }, [guilds]);

  const filteredGuilds = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return sortedGuilds;
    return sortedGuilds.filter((g) => {
      const name = String(g?.name || '').toLowerCase();
      const id = String(g?.id || '').toLowerCase();
      return name.includes(q) || id.includes(q);
    });
  }, [sortedGuilds, query]);

  const totals = useMemo(() => {
    const total = sortedGuilds.length;
    const banned = sortedGuilds.filter((g) => !!g?.banned?.status).length;
    return { total, banned };
  }, [sortedGuilds]);

  const setBan = async (guildId, status) => {
    setSavingId(guildId);
    try {
      const reason = String(reasonById[guildId] || '').trim();
      const permanent = !!permanentById[guildId];
      const expiresValue = permanent ? null : expiresById[guildId] || null;

      const res = await fetch(`/api/v1/admin/guilds/${guildId}/ban`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status,
          reason: status ? reason : '',
          expires: status ? expiresValue : null,
        }),
      });

      if (res.ok) {
        load();
      }
    } finally {
      setSavingId(null);
    }
  };

  return (
    <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
      <div className="p-6 border-b border-white/10">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold">Servidores</h2>
            <div className="text-xs text-gray-500">Lista desde MongoDB</div>
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <span className="px-2 py-1 rounded bg-white/5 border border-white/10">Total: {totals.total}</span>
            <span className="px-2 py-1 rounded bg-white/5 border border-white/10">Baneados: {totals.banned}</span>
          </div>
        </div>

        <div className="mt-5 flex flex-col md:flex-row md:items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar por nombre o ID..."
              className="w-full bg-black/50 border border-white/10 rounded-lg pl-9 pr-3 py-2 text-sm text-white focus:border-purple-500 outline-none"
            />
          </div>
          <button
            onClick={load}
            disabled={loading}
            className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm font-bold transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            <RefreshCw size={16} /> Recargar
          </button>
        </div>
      </div>

      {loading ? (
        <div className="p-6 flex items-center text-gray-500">
          <Loader2 className="animate-spin mr-2" size={18} /> Cargando...
        </div>
      ) : filteredGuilds.length === 0 ? (
        <div className="p-6 text-sm text-gray-500">No hay resultados.</div>
      ) : (
        <div className="divide-y divide-white/10">
          <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-3 text-[10px] font-bold text-gray-500 uppercase bg-black/20">
            <div className="col-span-5">Servidor</div>
            <div className="col-span-2">Bot</div>
            <div className="col-span-3">Estado</div>
            <div className="col-span-2 text-right">Acciones</div>
          </div>

          <div className="max-h-[640px] overflow-y-auto custom-scrollbar">
            {filteredGuilds.map((g) => {
              const banned = !!g?.banned?.status;
              const banReason = g?.banned?.reason || '';
              const banExpires = g?.banned?.expires || null;
              const isExpanded = expandedId === g.id;

              return (
                <div key={g.id} className="px-6 py-4 hover:bg-white/[0.03] transition-colors">
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start">
                    <div className="md:col-span-5 min-w-0">
                      <div className="font-bold truncate">{g.name}</div>
                      <div className="text-[11px] text-gray-500 font-mono truncate">{g.id}</div>
                    </div>

                    <div className="md:col-span-2">
                      {g.bot_join ? (
                        <span className="text-[10px] bg-purple-500/20 text-purple-300 px-2 py-1 rounded">Bot agregado</span>
                      ) : (
                        <span className="text-[10px] bg-white/5 text-gray-400 px-2 py-1 rounded">Sin bot</span>
                      )}
                    </div>

                    <div className="md:col-span-3">
                      {banned ? (
                        <div className="space-y-1">
                          <span className="inline-flex items-center gap-1 text-[10px] bg-red-500/20 text-red-300 px-2 py-1 rounded">
                            <Ban size={12} /> Baneado
                          </span>
                          <div className="text-xs text-gray-400">
                            <div className="truncate">Razón: <span className="text-gray-300">{banReason || '—'}</span></div>
                            <div className="truncate">Expira: <span className="text-gray-300">{formatDate(banExpires)}</span></div>
                          </div>
                        </div>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] bg-green-500/10 text-green-300 px-2 py-1 rounded">
                          <CheckCircle2 size={12} /> Activo
                        </span>
                      )}
                    </div>

                    <div className="md:col-span-2 flex md:justify-end gap-2">
                      <Link
                        href={`/dashboard/servers/${g.id}`}
                        className="px-3 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-xs font-bold transition-colors flex items-center gap-2"
                        title="Abrir dashboard del servidor"
                      >
                        <ExternalLink size={14} /> Editar
                      </Link>
                      <button
                        onClick={() => setExpandedId(isExpanded ? null : g.id)}
                        className="px-3 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-xs font-bold transition-colors"
                      >
                        Baneo
                      </button>
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="mt-4 bg-black/20 border border-white/10 rounded-xl p-4">
                      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                        <div className="md:col-span-6">
                          <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Razón</label>
                          <input
                            value={reasonById[g.id] || ''}
                            onChange={(e) => setReasonById((s) => ({ ...s, [g.id]: e.target.value }))}
                            className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-purple-500 outline-none"
                            placeholder="Opcional"
                          />
                        </div>
                        <div className="md:col-span-4">
                          <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Expira</label>
                          <input
                            type="datetime-local"
                            value={expiresById[g.id] || ''}
                            onChange={(e) => setExpiresById((s) => ({ ...s, [g.id]: e.target.value }))}
                            disabled={!!permanentById[g.id]}
                            className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-sm text-white disabled:opacity-50 focus:border-purple-500 outline-none"
                          />
                          <label className="mt-2 flex items-center gap-2 text-xs text-gray-400">
                            <input
                              type="checkbox"
                              checked={!!permanentById[g.id]}
                              onChange={(e) => setPermanentById((s) => ({ ...s, [g.id]: e.target.checked }))}
                            />
                            Permanente
                          </label>
                        </div>

                        <div className="md:col-span-2 flex md:justify-end items-start gap-2">
                          {banned ? (
                            <>
                              <button
                                onClick={() => setBan(g.id, true)}
                                disabled={savingId === g.id}
                                className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-xs font-bold transition-colors disabled:opacity-50"
                              >
                                {savingId === g.id ? '...' : 'Actualizar'}
                              </button>
                              <button
                                onClick={() => setBan(g.id, false)}
                                disabled={savingId === g.id}
                                className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-xs font-bold transition-colors disabled:opacity-50"
                              >
                                {savingId === g.id ? '...' : 'Quitar'}
                              </button>
                            </>
                          ) : (
                            <button
                              onClick={() => setBan(g.id, true)}
                              disabled={savingId === g.id}
                              className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg text-xs font-bold transition-colors disabled:opacity-50"
                            >
                              {savingId === g.id ? '...' : 'Banear'}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
