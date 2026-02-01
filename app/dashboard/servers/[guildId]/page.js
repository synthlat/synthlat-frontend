'use client';

import { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { MessageSquarePlus, Shield, LogOut, AlertTriangle, Ticket, BarChart3, Mic, Coins, UserPlus, Settings, Save, Loader2, RefreshCw } from 'lucide-react';
import Link from 'next/link';
import ModuleCard from '@/app/dashboard/components/ModuleCard';

export default function ServerDashboard() {
  const { guildId } = useParams();
  const searchParams = useSearchParams();
  const [guild, setGuild] = useState(null);
  const [settings, setSettings] = useState({ prefix: '!', language: 'es', timezone: 'UTC' });
  const [moduleStates, setModuleStates] = useState({});
  const [loading, setLoading] = useState(true);
  const [savingSettings, setSavingSettings] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async () => {
    try {
      // Fetch guild info
      const userGuildsRes = await fetch('/api/v1/user/guilds');
      const userGuilds = await userGuildsRes.json();
      const currentGuild = userGuilds.find(g => g.id === guildId);
      
      if (!currentGuild) {
        window.location.href = '/dashboard/servers';
        return;
      }
      setGuild(currentGuild);

      // If bot is not in guild, we don't need to fetch settings yet
      if (!currentGuild.bot_join) {
        setLoading(false);
        return;
      }

      // Fetch general settings
      const settingsRes = await fetch(`/api/v1/guilds/${guildId}/settings`);
      if (settingsRes.ok) {
        const settingsData = await settingsRes.json();
        setSettings(settingsData);
      }

      // Fetch all module states
      const modulesRes = await fetch(`/api/v1/guilds/${guildId}/modules`);
      if (modulesRes.ok) {
        const modulesData = await modulesRes.json();
        setModuleStates(modulesData);
      } else {
        setModuleStates({});
      }
      
      setLoading(false);

    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };

  useEffect(() => {
    // Check for refresh param (e.g. after inviting bot)
    const shouldRefresh = searchParams.get('refresh');
    if (shouldRefresh) {
      handleRefresh();
    } else {
      fetchData();
    }
  }, [guildId, searchParams]);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await fetch('/api/v1/user/refresh-guilds', { method: 'POST' });
      await fetchData();
    } catch (error) {
      console.error(error);
    } finally {
      setRefreshing(false);
    }
  };

  const handleSaveSettings = async () => {
    setSavingSettings(true);
    try {
      await fetch(`/api/v1/guilds/${guildId}/settings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });
    } catch (error) {
      console.error(error);
    } finally {
      setSavingSettings(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-screen text-gray-500"><Loader2 className="animate-spin mr-2" /> Cargando panel...</div>;
  }

  if (!guild) return null;

  if (!guild.bot_join) {
     return (
      <div className="p-8 text-center max-w-2xl mx-auto mt-20">
        <div className="bg-white/5 border border-white/10 rounded-2xl p-8">
          <h1 className="text-2xl font-bold mb-4">¡Casi listo!</h1>
          <p className="text-gray-400 mb-6">
            Para gestionar <strong>{guild.name}</strong>, primero necesitas invitar a Synthlat al servidor.
          </p>
          <div className="flex flex-col gap-4 items-center">
            <a 
              href={`https://discord.com/api/oauth2/authorize?client_id=${process.env.NEXT_PUBLIC_DISCORD_CLIENT_ID}&permissions=8&scope=bot%20applications.commands&guild_id=${guild.id}&redirect_uri=${encodeURIComponent(window.location.origin + `/dashboard/servers/${guild.id}?refresh=true`)}&response_type=code`}
              className="inline-block px-8 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-full font-bold transition-all shadow-[0_0_20px_rgba(147,51,234,0.4)]"
            >
              Invitar Synthlat Ahora
            </a>
            <button 
              onClick={handleRefresh}
              disabled={refreshing}
              className="text-sm text-gray-500 hover:text-white flex items-center gap-2 transition-colors"
            >
              {refreshing ? <Loader2 className="animate-spin" size={14} /> : <RefreshCw size={14} />}
              Ya lo invité, recargar estado
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Server Header */}
      <div className="flex items-center gap-6 mb-10 pb-8 border-b border-white/10">
        <div className="relative w-20 h-20 rounded-full bg-gray-800 shrink-0 overflow-hidden border-2 border-purple-500 shadow-[0_0_20px_rgba(168,85,247,0.3)]">
          {guild.icon_url ? (
            <img 
              src={guild.icon_url} 
              alt={guild.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-3xl font-bold text-gray-500">
              {guild.name.substring(0, 2).toUpperCase()}
            </div>
          )}
        </div>
        <div>
          <h1 className="text-3xl font-bold mb-1">{guild.name}</h1>
          <div className="flex items-center gap-2 text-gray-400 text-sm">
            <span className="px-2 py-0.5 bg-purple-500/20 text-purple-300 rounded text-xs font-medium">ID: {guild.id}</span>
            <span>•</span>
            <span>Panel de Control</span>
          </div>
        </div>
      </div>

      {/* General Settings Section */}
      <div className="mb-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Settings className="text-gray-400" />
            Ajustes Generales
          </h2>
          <button 
            onClick={handleSaveSettings}
            disabled={savingSettings}
            className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm font-medium transition-colors"
          >
            {savingSettings ? <Loader2 className="animate-spin w-4 h-4" /> : <Save className="w-4 h-4" />}
            Guardar Cambios
          </button>
        </div>
        
        <div className="bg-white/5 border border-white/10 rounded-xl p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm text-gray-400 mb-2">Prefijo del Bot</label>
            <input 
              type="text" 
              value={settings.prefix}
              onChange={(e) => setSettings({...settings, prefix: e.target.value})}
              className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-purple-500 focus:outline-none"
              placeholder="!"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-2">Idioma</label>
            <select 
              value={settings.language}
              onChange={(e) => setSettings({...settings, language: e.target.value})}
              className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-purple-500 focus:outline-none appearance-none"
            >
              <option value="es">Español</option>
              <option value="en">English</option>
              <option value="pt">Português</option>
            </select>
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-2">Zona Horaria</label>
            <select 
              value={settings.timezone}
              onChange={(e) => setSettings({...settings, timezone: e.target.value})}
              className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-purple-500 focus:outline-none appearance-none"
            >
              <option value="UTC">UTC</option>
              <option value="America/Mexico_City">Mexico City (UTC-6)</option>
              <option value="America/Bogota">Bogota (UTC-5)</option>
              <option value="America/Lima">Lima (UTC-5)</option>
              <option value="America/Santiago">Lima (UTC-5)</option>
              <option value="America/Caracas">Caracas (UTC-5)</option>
              <option value="America/La_Paz">La Paz (UTC-4)</option>
              <option value="America/Santiago">Santiago (UTC-4)</option>
              <option value="America/Argentina/Buenos_Aires">Buenos Aires (UTC-3)</option>
              <option value="Europe/Madrid">Madrid (UTC+1)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Modules Grid */}
      <div>
        <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
          <Shield className="text-purple-400" />
          Módulos
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          
          <ModuleCard 
            icon={<MessageSquarePlus size={24} />}
            color="text-green-400"
            bgColor="bg-green-500/10"
            title="Bienvenidas"
            description="Personaliza los mensajes de bienvenida, tarjetas de imagen y roles automáticos."
            moduleName="welcome"
            guildId={guildId}
            initialEnabled={moduleStates.welcome}
          />

          <ModuleCard 
            icon={<LogOut size={24} />}
            color="text-red-400"
            bgColor="bg-red-500/10"
            title="Despedidas"
            description="Configura mensajes automáticos cuando un miembro abandona el servidor."
            moduleName="bye"
            guildId={guildId}
            initialEnabled={moduleStates.bye}
          />

          <ModuleCard 
            icon={<UserPlus size={24} />}
            color="text-indigo-400"
            bgColor="bg-indigo-500/10"
            title="Invite Tracker"
            description="Rastrea quién invita a nuevos miembros y muestra estadísticas."
            moduleName="invitetracker"
            guildId={guildId}
            initialEnabled={moduleStates.invitetracker}
          />

          <ModuleCard 
            icon={<Coins size={24} />}
            color="text-yellow-400"
            bgColor="bg-yellow-500/10"
            title="Economía"
            description="Gestiona la moneda del servidor, tiendas de usuarios y subastas."
            moduleName="economy"
            guildId={guildId}
            initialEnabled={moduleStates.economy}
          />

          <ModuleCard 
            icon={<BarChart3 size={24} />}
            color="text-purple-400"
            bgColor="bg-purple-500/10"
            title="Niveles"
            description="Sistema de XP y niveles con recompensas y notificaciones personalizables."
            moduleName="levels"
            guildId={guildId}
            initialEnabled={moduleStates.levels}
          />

          <ModuleCard 
            icon={<Ticket size={24} />}
            color="text-blue-400"
            bgColor="bg-blue-500/10"
            title="Tickets"
            description="Crea paneles de soporte con categorías personalizadas para tu comunidad."
            moduleName="tickets"
            guildId={guildId}
            initialEnabled={moduleStates.tickets}
          />

          <ModuleCard 
            icon={<AlertTriangle size={24} />}
            color="text-orange-400"
            bgColor="bg-orange-500/10"
            title="Reportes"
            description="Sistema de denuncias con análisis de IA para detectar toxicidad automáticamente."
            moduleName="reports"
            guildId={guildId}
            initialEnabled={moduleStates.reports}
          />

          <ModuleCard 
            icon={<Mic size={24} />}
            color="text-cyan-400"
            bgColor="bg-cyan-500/10"
            title="Canales Temporales"
            description="Permite a los usuarios crear sus propios canales de voz dinámicos (Join to Create)."
            moduleName="tempvoice"
            guildId={guildId}
            initialEnabled={moduleStates.tempvoice}
          />
          
        </div>
      </div>
    </div>
  );
}
