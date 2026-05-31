import { redirect } from 'next/navigation';
import { getUser } from '@/lib/auth';

const OWNER_ID = process.env.OWNER_ID;

export default async function AdminRootLayout({ children }) {
  const user = await getUser();

  if (!user) {
    redirect('/api/v1/oauth/discord');
  }

  if (user.discordId !== OWNER_ID) {
    redirect('/dashboard');
  }

  return <>{children}</>;
}
