'use client';
import { Preview } from '@/data/chat';
import React from 'react';
import { Button, buttonVariants } from './ui/button';
import { Plus } from 'lucide-react';
import { Input } from './ui/input';
import { ChatBubbleIcon } from '@radix-ui/react-icons';
import { Session } from '@/lib/sessions';
import { cn } from '@/lib/utils';
import Link from 'next/link';

export const ChatListPanel = ({ sessions }: { sessions: Session[] }) => {
  const [search, setSearch] = React.useState('');

  function createNewSession() {}

  // filter previews based on search by name and messages
  const filteredPreviews = sessions.filter(
    (preview) =>
      preview.title.toLowerCase().includes(search.toLowerCase()) ||
      preview.messages.some((message) =>
        message.content.toLowerCase().includes(search.toLowerCase())
      )
  );

  if (sessions.length === 0) {
    return (
      <div className="text-foreground border-r border-border p-4 w-1/4 min-w-[230px] h-full flex flex-col">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-semibold tracking-tight">Sessions</h2>
          <Button
            onClick={createNewSession}
            variant={'outline'}
            className="rounded-md"
          >
            <Plus className="w-4 h-4" />
          </Button>
        </div>
        <div className="overflow-y-auto flex-grow space-y-2">No sessions</div>
      </div>
    );
  }

  return (
    <div className="text-foreground border-r border-border p-4 w-1/4 min-w-[230px] h-full flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-semibold tracking-tight">Sessions</h2>
        <Button
          onClick={createNewSession}
          variant={'outline'}
          className="rounded-md"
        >
          <Plus className="w-4 h-4" />
        </Button>
      </div>

      {}
      <Input
        className="p-2 pl-4 rounded-md  w-full mb-4 max-h-[35px]"
        type="text"
        placeholder="Search Chats..."
        onChange={(e) => setSearch(e?.target?.value ?? '')}
      />

      <div className="overflow-y-auto flex-grow space-y-2">
        {filteredPreviews.map(({ title, id }, index) => (
          <ChatPreview key={id} id={id} title={title} isActive={false} />
        ))}
      </div>
    </div>
  );
};

function ChatPreview({
  id,
  title,
  isActive,
}: {
  id: string;
  title: string;
  isActive: boolean;
}) {
  return (
    <div className="flex">
      <Link
        href={`/chat/${id}`}
        className={cn(
          buttonVariants({ variant: 'ghost' }),
          'w-full justify-start',
          isActive
            ? 'bg-secondary-foreground/10'
            : 'dark:hover:bg-secondary/50 hover:bg-secondary-foreground/5'
        )}
      >
        <ChatBubbleIcon className="mr-4 h-4 w-4" />
        <span className=" w-full truncate text-left">{title}</span>
      </Link>
    </div>
  );
}
