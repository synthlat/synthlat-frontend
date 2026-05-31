'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Server, User, ShieldAlert, Menu, X } from 'lucide-react';

export default function MobileNav() {
  const [user, setUser] = useState(null);
  const [isOwner, setIsOwner] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
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

  // Close menu on route change
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  return (
    <>
      {/* Bottom Bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-black/90 backdrop-blur-lg border-t border-white/10 z-50 flex justify-around items-center p-2 pb-4 safe-area-bottom">
        <MobileNavItem href="/dashboard" icon={<LayoutDashboard size={24} />} label="Inicio" active={pathname === '/dashboard'} />
        <MobileNavItem href="/dashboard/servers" icon={<Server size={24} />} label="Servidores" active={pathname === '/dashboard/servers'} />
        
        {/* Profile / Avatar */}
        <Link href="/dashboard/profile" className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-colors ${pathname === '/dashboard/profile' ? 'text-purple-400' : 'text-gray-400'}`}>
          <div className={`w-7 h-7 rounded-full overflow-hidden border-2 ${pathname === '/dashboard/profile' ? 'border-purple-500' : 'border-transparent'}`}>
            {user ? (
              <img 
                src={user.avatar_url || 'https://cdn.synth.lat/images/discord/avatar_default.png'} 
                alt="Profile" 
                className="w-full h-full object-cover"
                onError={(e) => e.target.src = 'https://cdn.synth.lat/images/discord/avatar_default.png'}
              />
            ) : (
              <div className="w-full h-full bg-gray-700 animate-pulse" />
            )}
          </div>
          <span className="text-[10px] font-medium">Perfil</span>
        </Link>

        {isOwner && (
          <MobileNavItem href="/dashboard/admin" icon={<ShieldAlert size={24} />} label="Admin" active={pathname === '/dashboard/admin'} />
        )}
      </div>
    </>
  );
}

function MobileNavItem({ href, icon, label, active }) {
  return (
    <Link 
      href={href} 
      className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-colors ${
        active ? 'text-purple-400' : 'text-gray-400'
      }`}
    >
      {icon}
      <span className="text-[10px] font-medium">{label}</span>
    </Link>
  );
}
