'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Newspaper, Server, ChevronLeft, ShieldAlert } from 'lucide-react';

function NavItem({ href, icon, label, active }) {
  return (
    <Link
      href={href}
      className={`flex items-center gap-3 px-4 py-2.5 rounded-lg border transition-colors ${
        active
          ? 'bg-white/10 border-white/20 text-white'
          : 'bg-transparent border-transparent text-gray-400 hover:text-white hover:bg-white/5 hover:border-white/10'
      }`}
    >
      <span className="shrink-0">{icon}</span>
      <span className="text-sm font-semibold">{label}</span>
    </Link>
  );
}

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-72 border-r border-white/10 bg-black/50 hidden md:flex flex-col h-screen sticky top-0">
      <div className="p-6 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
            <ShieldAlert size={18} className="text-purple-400" />
          </div>
          <div>
            <div className="font-bold leading-tight">Admin Panel</div>
            <div className="text-xs text-gray-500">Owner tools</div>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-2 overflow-y-auto custom-scrollbar">
        <NavItem
          href="/dashboard/admin"
          icon={<LayoutDashboard size={18} />}
          label="Inicio"
          active={pathname === '/dashboard/admin'}
        />
        <NavItem
          href="/dashboard/admin/news"
          icon={<Newspaper size={18} />}
          label="Novedades"
          active={pathname.startsWith('/dashboard/admin/news')}
        />
        <NavItem
          href="/dashboard/admin/servers"
          icon={<Server size={18} />}
          label="Servidores"
          active={pathname.startsWith('/dashboard/admin/servers')}
        />

        <div className="pt-3 mt-3 border-t border-white/5">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 text-xs text-gray-500 hover:text-white px-2 py-2 transition-colors"
          >
            <ChevronLeft size={12} /> Volver al Dashboard
          </Link>
        </div>
      </nav>
    </aside>
  );
}
