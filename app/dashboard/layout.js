import { redirect } from 'next/navigation';
import { getUser } from '@/lib/auth';
import DashboardChrome from './components/DashboardChrome';

export default async function DashboardLayout({ children }) {
  const user = await getUser();
  
  if (!user) {
    redirect('/api/v1/oauth/discord');
  }

  return <DashboardChrome>{children}</DashboardChrome>;
}
