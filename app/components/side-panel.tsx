import { getAllSessionsForUser } from '@/lib/sessions';
import { ChatListPanel } from './chat-list-panel';

export default async function SidePanel() {
  const userId = '1';

  const sessions = await getAllSessionsForUser({ userId });
  return <ChatListPanel sessions={sessions ?? []} />;
}
