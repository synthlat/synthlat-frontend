import { redirect } from 'next/navigation';
import Sidebar from './components/Sidebar';
import MobileNav from './components/MobileNav';
import { getUser } from '@/lib/auth';

export default async function DashboardLayout({ children }) {
  const user = await getUser();
  
  if (!user) {
    redirect('/api/v1/oauth/discord');
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
