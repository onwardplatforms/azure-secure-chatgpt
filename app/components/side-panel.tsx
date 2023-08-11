import { getUserSessions } from '@/lib/sessions';
import { ChatListPanel } from './chat-list-panel';

export default async function SidePanel() {
  // retrieve the user id
  const userId = '1';
  // retrieve the list of sessions
  // const sessions = await getUserSessions(userId);
  return <ChatListPanel sessions={[]} />;
}
