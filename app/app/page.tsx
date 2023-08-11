import { Metadata } from 'next';

import { Header } from '@/components/header';
import Playground from '@/components/playground';
import Chat from '@/components/chat';
import AuthenticationPage from '@/components/login';
import SidePanel from '@/components/side-panel';
import { generateNanoid } from '@/lib/utils';

export const metadata: Metadata = {
  title: 'Playground',
  description: 'The OpenAI Playground built using the components.',
};

export default function Page() {
  const isLoggedIn = true;
  // const id = generateNanoid();

  if (isLoggedIn) {
    return (
      <main className="relative flex-col h-full items-center justify-center p-8 bg-gradient-to-br dark:from-slate-950 from-gray-100  to-white  dark:to-black">
        <Header />
        <Chat>
          <SidePanel />
        </Chat>
      </main>
    );
  }

  return <AuthenticationPage />;
}
