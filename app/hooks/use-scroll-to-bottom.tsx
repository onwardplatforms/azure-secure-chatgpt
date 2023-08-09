import { Message } from 'ai/react';
import React from 'react';

export default function useScrollToBottom({
  messages,
}: {
  messages: Message[] | null;
}) {
  const ref = React.useRef<HTMLDivElement>(null);
  React.useEffect(() => {
    if (ref.current) {
      ref.current.scrollTop = ref.current.scrollHeight;
    }
  }, [messages]);
  return ref;
}
