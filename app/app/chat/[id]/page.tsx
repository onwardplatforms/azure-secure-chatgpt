import { Metadata } from 'next';
import { Header } from '@/components/header';
import Chat from '@/components/chat';
import AuthenticationPage from '@/components/login';
import SidePanel from '@/components/side-panel';
import { deleteSessionById, getMessagesForSession } from '@/lib/sessions';
import { redirect } from 'next/navigation';

export const metadata: Metadata = {
  title: 'Playground',
  description: 'The OpenAI Playground built using the components.',
};

export interface ChatPageProps {
  params: {
    id: string;
  };
}

export default async function Page({ params }: ChatPageProps) {
  const userId = '1';

  const initialMessages = await getMessagesForSession({
    sessionId: params.id,
    userId,
  });

  if (!initialMessages.ok) {
    redirect('/');
  }

  const { messages, title } = initialMessages;

  const isLoggedIn = true;

  if (isLoggedIn) {
    return (
      <main className="relative flex-col h-full items-center justify-center p-8 bg-gradient-to-br dark:from-slate-950 from-gray-100  to-white  dark:to-black">
        <Header />
        <Chat
          title={title}
          userId={userId}
          deleteAction={deleteSessionById}
          id={params.id}
          initialMessages={messages}
        >
          <SidePanel />
        </Chat>
      </main>
    );
  }

  return <AuthenticationPage />;
}
