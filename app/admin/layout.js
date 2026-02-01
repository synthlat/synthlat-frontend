import { redirect } from 'next/navigation';
import Sidebar from '@/app/dashboard/components/Sidebar';
import MobileNav from '@/app/dashboard/components/MobileNav';
import { getUser } from '@/lib/auth';

const OWNER_ID = process.env.OWNER_ID;

export default async function AdminLayout({ children }) {
  const user = await getUser();
  
  if (!user || user.discordId !== OWNER_ID) {
    redirect('/dashboard');
  }

  return (
    <div className="min-h-screen bg-black text-white flex flex-col md:flex-row">
      <Sidebar />
      <main className="flex-1 overflow-y-auto h-[calc(100vh-80px)] md:h-screen pb-20 md:pb-0">
        {children}
      </main>
      <MobileNav />
    </div>
  );
}
