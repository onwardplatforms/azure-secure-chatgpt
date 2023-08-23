import { Metadata } from 'next';

import { Header } from '@/components/header';
import Playground from '@/components/playground';
import Chat from '@/components/chat';
import AuthenticationPage from '@/components/login';
import SidePanel from '@/components/side-panel';
import { generateNanoid } from '@/lib/utils';
import { deleteSessionById, getAllSessionsForUser } from '@/lib/sessions';
import { headers } from 'next/headers';

export const metadata: Metadata = {
  title: 'Playground',
  description: 'The OpenAI Playground built using the components.',
};

export default async function Page() {
  const isLoggedIn = true;
  const userId = '1';

  const sessions = await getAllSessionsForUser({ userId });

  if (isLoggedIn) {
    return (
      <main className="relative flex-col h-full items-center justify-center p-8 bg-gradient-to-br dark:from-slate-950 from-gray-100  to-white  dark:to-black">
        <Header />
        <Chat userId={userId}>
          <SidePanel />
        </Chat>
      </main>
    );
  }

  return <AuthenticationPage />;
}
