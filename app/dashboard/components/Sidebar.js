'use client';

import Image from 'next/image';
import { LogOut, LayoutDashboard, Server, User, ChevronLeft, ShieldAlert, MessageSquarePlus, Shield, Music, Ticket, BarChart3, Coins, UserPlus, Mic, AlertTriangle } from 'lucide-react';
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';

export default function Sidebar() {
  const [user, setUser] = useState(null);
  const [currentGuild, setCurrentGuild] = useState(null);
  const [isOwner, setIsOwner] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    fetch('/api/v1/user')
      .then(res => {
        if (res.ok) return res.json();
        return null;
      })
      .then(data => {
        setUser(data);
        fetch('/api/v1/user/is-owner')
          .then(res => res.json())
          .then(data => setIsOwner(data.isOwner))
          .catch(() => setIsOwner(false));
      })
      .catch(err => console.error('Failed to fetch user', err));
  }, []);

  useEffect(() => {
    // Check if we are in a server context
    const match = pathname.match(/\/dashboard\/servers\/(\d+)/);
    if (match && match[1]) {
      const guildId = match[1];
      // Fetch guild info if not already set or different
      if (!currentGuild || currentGuild.id !== guildId) {
        fetch('/api/v1/user/guilds')
          .then(res => res.json())
          .then(guilds => {
            const guild = guilds.find(g => g.id === guildId);
            if (guild) setCurrentGuild(guild);
          });
      }
    } else {
      setCurrentGuild(null);
    }
  }, [pathname]);

  return (
    <aside className="w-64 border-r border-white/10 bg-black/50 hidden md:flex flex-col h-screen sticky top-0">
       <a href="/dashboard">
          <div className="p-6 flex items-center gap-3 border-b border-white/10">
            <div className="relative w-8 h-8 rounded-full overflow-hidden border border-purple-500">
               <Image
                  src="/images/logo.png"
                  alt="Synthlat Logo"
                  fill
                  className="object-cover"
                />
            </div>
            <span className="font-bold text-lg">Synthlat</span>
          </div>
       </a>

      <nav className="flex-1 p-4 space-y-2 overflow-y-auto custom-scrollbar">
        {currentGuild ? (
          <div className="animate-fade-in-up">
            <Link 
              href="/dashboard/servers" 
              className="flex items-center gap-2 text-xs text-gray-500 hover:text-white mb-3 px-2 transition-colors"
            >
              <ChevronLeft size={12} /> Volver a la lista
            </Link>
            <div className="bg-white/5 border border-white/10 rounded-xl p-3 flex items-center gap-3 mb-4">
              <div className="relative w-10 h-10 rounded-full overflow-hidden bg-gray-800 shrink-0">
                {currentGuild.icon_url ? (
                  <img src={currentGuild.icon_url} alt={currentGuild.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-xs font-bold text-gray-500">
                    {currentGuild.name.substring(0, 2).toUpperCase()}
                  </div>
                )}
              </div>
              <div className="overflow-hidden">
                <div className="font-bold text-sm truncate text-white">{currentGuild.name}</div>
                <div className="text-[10px] text-purple-400">Gestionando</div>
              </div>
            </div>
            
            <div className="space-y-1">
              <NavItem href={`/dashboard/servers/${currentGuild.id}`} icon={<LayoutDashboard size={18} />} label="Vista General" active={pathname === `/dashboard/servers/${currentGuild.id}`} />
              
              <div className="pt-2 mt-2 border-t border-white/5">
                <p className="px-4 text-xs font-bold text-gray-500 uppercase mb-2">Módulos</p>
                <NavItem href={`/dashboard/servers/${currentGuild.id}/welcome`} icon={<MessageSquarePlus size={18} />} label="Bienvenidas" active={pathname.includes('/welcome')} />
                <NavItem href={`/dashboard/servers/${currentGuild.id}/bye`} icon={<LogOut size={18} />} label="Despedidas" active={pathname.includes('/bye')} />
                <NavItem href={`/dashboard/servers/${currentGuild.id}/invitetracker`} icon={<UserPlus size={18} />} label="Invite Tracker" active={pathname.includes('/invitetracker')} />
                <NavItem href={`/dashboard/servers/${currentGuild.id}/economy`} icon={<Coins size={18} />} label="Economía" active={pathname.includes('/economy')} />
                <NavItem href={`/dashboard/servers/${currentGuild.id}/levels`} icon={<BarChart3 size={18} />} label="Niveles" active={pathname.includes('/levels')} />
                <NavItem href={`/dashboard/servers/${currentGuild.id}/tickets`} icon={<Ticket size={18} />} label="Tickets" active={pathname.includes('/tickets')} />
                <NavItem href={`/dashboard/servers/${currentGuild.id}/reports`} icon={<AlertTriangle size={18} />} label="Reportes" active={pathname.includes('/reports')} />
                <NavItem href={`/dashboard/servers/${currentGuild.id}/tempvoice`} icon={<Mic size={18} />} label="Canales Temp." active={pathname.includes('/tempvoice')} />
              </div>
            </div>
          </div>
        ) : (
          <>
            <NavItem href="/dashboard" icon={<LayoutDashboard size={20} />} label="Inicio" active={pathname === '/dashboard'} />
            <NavItem href="/dashboard/servers" icon={<Server size={20} />} label="Servidores" active={pathname === '/dashboard/servers'} />
            
            <div className="pt-2 mt-2 border-t border-white/5 space-y-2">
              <NavItem href="/profile" icon={<User size={20} />} label="Mi Perfil" active={pathname === '/profile'} />
              {isOwner && (
                <NavItem href="/admin" icon={<ShieldAlert size={20} />} label="Admin Panel" active={pathname === '/admin'} />
              )}
            </div>
          </>
        )}
      </nav>

      <div className="p-4 border-t border-white/10">
        {user ? (
          <div className="flex items-center gap-3 mb-4 px-2">
            <div className="relative w-10 h-10 rounded-full overflow-hidden bg-gray-700">
              {user.avatar_url ? (
                <img 
                  src={user.avatar_url} 
                  alt={user.username}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-xs">{user.username?.[0]}</div>
              )}
            </div>
            <div className="flex-1 overflow-hidden">
              <div className="font-medium truncate">{user.global_name || user.username}</div>
              <div className="text-xs text-gray-400 truncate">@{user.username}</div>
            </div>
          </div>
        ) : (
          <div className="h-14 mb-4 animate-pulse bg-white/5 rounded-lg"></div>
        )}

        <form action="/api/v1/auth/logout" method="POST">
           <button className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-400 hover:bg-red-500/10 rounded-lg transition-colors">
             <LogOut size={16} />
             Cerrar Sesión
           </button>
        </form>
      </div>
    </aside>
  );
}

function NavItem({ icon, label, href, active }) {
  return (
    <Link 
      href={href}
      className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors text-sm ${
        active 
          ? 'bg-purple-600/20 text-purple-400 border border-purple-600/20' 
          : 'text-gray-400 hover:bg-white/5 hover:text-white'
      }`}
    >
      {icon}
      <span className="font-medium">{label}</span>
    </Link>
  );
}
