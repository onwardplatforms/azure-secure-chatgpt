import { Metadata } from 'next';

import { Header } from '@/components/header';
import Playground from '@/components/playground';
import Chat from '@/components/chat';
import AuthenticationPage from '@/components/login';

export const metadata: Metadata = {
  title: 'Playground',
  description: 'The OpenAI Playground built using the components.',
};

export default function PlaygroundPage() {
  const isLoggedIn = true;

  if (isLoggedIn) {
    return (
      <main className="relative flex-col h-full items-center justify-center p-8 bg-gradient-to-br dark:from-slate-950 from-gray-100  to-white  dark:to-black">
        <Header />
        <Chat />
      </main>
    );
  }

  return <AuthenticationPage />;
}
