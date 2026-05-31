'use client';

import { usePathname } from 'next/navigation';
import Sidebar from './Sidebar';
import MobileNav from './MobileNav';
import AdminSidebar from '../admin/components/AdminSidebar';

export default function DashboardChrome({ children }) {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith('/dashboard/admin');

  return (
    <div className="min-h-screen bg-black text-white flex flex-col md:flex-row">
      {isAdmin ? <AdminSidebar /> : <Sidebar />}
      <main className="flex-1 overflow-y-auto h-[calc(100vh-80px)] md:h-screen pb-20 md:pb-0">{children}</main>
      {!isAdmin && <MobileNav />}
    </div>
  );
}
