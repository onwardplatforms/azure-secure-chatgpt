'use client';
import React from 'react';
import { Button } from './ui/button';
import {
  CaretSortIcon,
  ChatBubbleIcon,
  ReloadIcon,
  StopIcon,
} from '@radix-ui/react-icons';
import { Preview, previews } from '@/data/chat';
import { Input } from './ui/input';
import { CheckIcon, Plus, SendHorizonal, ShareIcon } from 'lucide-react';
import DeleteAlert from './delete-alert';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Icons } from './ui/icons';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { cn } from '@/lib/utils';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from './ui/command';
import { Dialog } from './ui/dialog';
import { WelcomeScreen } from './welcome-screen';
import { type Message, useChat } from 'ai/react';
import { useToast } from './ui/use-toast';
import { useEnterSubmit } from '@/hooks/use-enter-submit';
import useScrollToBottom from '@/hooks/use-scroll-to-bottom';
import { ShareButton } from './share-button';

export default function Chat({
  id,
  initialMessages,
  children,
}: {
  id?: string;
  initialMessages?: Message[];
  children?: React.ReactNode;
}) {
  const { toast } = useToast();
  const previewToken = process.env.PREVIEW_TOKEN;
  const { messages, append, reload, stop, isLoading, input, setInput } =
    useChat({
      initialMessages,
      id,
      body: {
        id,
        previewToken,
      },
      onError(error) {
        console.log('Error', error);
      },
      onResponse(response) {
        if (response.status === 401 || response.status > 400) {
          toast({ variant: 'destructive', description: response.statusText });
        }
      },
    });

  return (
    <div className="flex w-full h-full">
      {children}

      <ChatWindow
        isLoading={isLoading}
        reload={reload}
        append={append}
        messages={messages}
        stop={stop}
        // id={id}
      />
    </div>
  );
}

const ChatWindow = ({
  messages,
  append,
  title = 'No title',
  isLoading,
  stop,
  reload,
  id,
}: {
  messages: Message[] | null;
  append: Function;
  title?: string;
  isLoading: boolean;
  stop: Function;
  reload: Function;
  id?: string;
}) => {
  const groups = [
    {
      label: 'GPT Models',
      teams: [
        {
          label: 'GPT-3.5 turbo',
          value: 'gpt3.5turbo',
        },
        {
          label: 'GPT-4',
          value: 'gpt4',
        },
      ],
    },
    {
      label: 'Azure Models',
      teams: [
        {
          label: 'Azure GPT-3.5 turbo',
          value: 'azuregpt3.5turbo',
        },
        {
          label: 'Azure GPT-4',
          value: 'azuregpt4',
        },
      ],
    },
  ];
  type Team = (typeof groups)[number]['teams'][number];

  const [open, setOpen] = React.useState(false);
  const [showNewTeamDialog, setShowNewTeamDialog] = React.useState(false);
  const [selectedTeam, setSelectedTeam] = React.useState<Team>(
    groups[0].teams[0]
  );
  const [input, setInput] = React.useState('');

  const messagesEndRef = useScrollToBottom({ messages });

  console.log(messages?.length);

  if (messages?.length === 0 || !messages)
    return (
      <div className="text-foreground flex justify-center items-center flex-col h-full w-full">
        <Dialog open={showNewTeamDialog} onOpenChange={setShowNewTeamDialog}>
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={open}
                aria-label="Select a team"
                className={cn('w-[200px] justify-between')}
              >
                <Avatar className="mr-2 h-5 w-5">
                  <AvatarImage
                    src={`https://avatar.vercel.sh/${selectedTeam.value}.png`}
                    alt={selectedTeam.label}
                  />
                  <AvatarFallback>SC</AvatarFallback>
                </Avatar>
                {selectedTeam.label}
                <CaretSortIcon className="ml-auto h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[200px] p-0">
              <Command>
                <CommandList>
                  <CommandInput placeholder="Search models..." />
                  <CommandEmpty>No team found.</CommandEmpty>
                  {groups.map((group) => (
                    <CommandGroup key={group.label} heading={group.label}>
                      {group.teams.map((team) => (
                        <CommandItem
                          key={team.value}
                          onSelect={() => {
                            setSelectedTeam(team);
                            setOpen(false);
                          }}
                          className="text-sm"
                        >
                          <Avatar className="mr-2 h-5 w-5">
                            <AvatarImage
                              src={`https://avatar.vercel.sh/${team.value}.png`}
                              alt={team.label}
                              className="grayscale"
                            />
                            <AvatarFallback>SC</AvatarFallback>
                          </Avatar>
                          {team.label}
                          <CheckIcon
                            className={cn(
                              'ml-auto h-4 w-4',
                              selectedTeam.value === team.value
                                ? 'opacity-100'
                                : 'opacity-0'
                            )}
                          />
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  ))}
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </Dialog>
        <div className="flex my-4">
          <WelcomeScreen setInput={setInput} />
        </div>

        <div className="py-8 px-16 flex items-center mt-auto w-full">
          <ExpandingTextarea
            input={input}
            setInput={setInput}
            onSubmit={async (value: string) => {
              console.log('Submitting');
              await append({
                content: value,
                role: 'user',
              });
            }}
          />
        </div>
      </div>
    );
  return (
    <div className="text-foreground flex flex-col h-full w-full">
      <div className="p-4 border-b border-border flex items-center justify-between">
        <Input
          className="text-lg font-semibold w-fit border-none bg-transparent"
          defaultValue={title}
        />
        <div>
          <ShareButton />
          <DeleteAlert />
        </div>
      </div>
      <div
        ref={messagesEndRef}
        className="flex-grow overflow-y-auto py-4 px-20"
      >
        <div className="flex flex-col justify-start items-start px-4 flex-grow">
          {messages.map((message, index) => {
            const isUser = message.role === 'user';

            return (
              <div key={index} className="py-4">
                <p className="text-sm text-muted-foreground py-2">
                  {isUser ? 'You' : 'Model'}
                </p>
                <div
                  className={`text-base flex justify-center items-center rounded ${
                    isUser ? 'bg-user-message' : 'bg-model-message'
                  }`}
                >
                  <div className="flex mr-2 justify-center items-start">
                    {isUser ? (
                      <Avatar className="flex w-8 h-8 mr-2 border rounded-sm  border-border">
                        <AvatarImage
                          src="https://github.com/shadcn.png"
                          alt="@shadcn"
                        />
                        {/* <AvatarFallback>CN</AvatarFallback> */}
                      </Avatar>
                    ) : (
                      <div className="flex w-8 h-8 mr-2 p-2 border rounded-sm bg-gradient-to-tr dark:from-slate-800 from-slate-200 to-background border-border">
                        <Icons.chatGPT className="w-4 h-4" />
                      </div>
                    )}
                    <p
                      style={{ lineHeight: '32px' }}
                      className="min-h-[20px] px-6 flex flex-col items-start gap-3 overflow-x-auto whitespace-pre-wrap break-words"
                    >
                      {message.content}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <div className="py-8 px-16 flex items-center relative">
        <ChatFooter
          stop={stop}
          reload={reload}
          isLoading={isLoading}
          messages={messages}
        />
        <ExpandingTextarea
          input={input}
          setInput={setInput}
          onSubmit={async (value: string) => {
            await append({
              id,
              content: value,
              role: 'user',
            });
          }}
        />
      </div>
    </div>
  );
};

interface ExpandingTextareaProps {
  onSubmit: Function;
  input: string;
  setInput: Function;
}
const ExpandingTextarea: React.FC<ExpandingTextareaProps> = ({
  onSubmit,
  input,
  setInput,
}) => {
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);
  const { formRef, onKeyDown } = useEnterSubmit();

  React.useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.focus();
    }
  }, []);

  const handleInput = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      // Reset the height to minimum value
      textarea.style.height = '24px';

      // Calculate the number of lines based on scrollHeight
      const lines = Math.ceil(textarea.scrollHeight / 24);
      const newHeight = lines * 24;

      // If textarea height exceeds 200px, set maximum height and add scroll behavior
      if (newHeight > 200) {
        textarea.style.height = '200px';
        textarea.style.overflowY = 'scroll';
      } else {
        textarea.style.height = `${newHeight}px`;
        textarea.style.overflowY = 'hidden'; // Hide scrollbar when below maximum height
      }
    }
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    console.log('Prevented default');
    if (!input?.trim()) {
      return;
    }
    setInput('');
    await onSubmit(input);
  };

  React.useEffect(() => {
    handleInput(); // To adjust the height on initial render
  }, [input]);

  return (
    <form className="block w-full" ref={formRef} onSubmit={handleSubmit}>
      <div className="focus:ring-2 bg-background flex items-center w-full py-4 px-6 border-2 rounded-sm justify-center ">
        <textarea
          onKeyDown={onKeyDown}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          ref={textareaRef}
          autoCorrect="false"
          className="bg-bg focus-visible:ring-0 focus:outline-none focus-within:ring-0 focus:ring-0 m-0 w-full resize-none border-0 bg-transparent  dark:bg-transparent  "
          placeholder="Send a message."
          style={{ overflowY: 'hidden', height: '24px' }} // Prevent scroll bar flashing
        />
        <Button className="mt-auto" type="submit">
          <SendHorizonal className="w-4 h-4 " />
        </Button>
      </div>
    </form>
  );
};

// Regenerate response and Share buttons to hover above input
function ChatFooter({
  isLoading,
  stop,
  reload,
  messages,
}: {
  isLoading: boolean;
  stop: Function;
  reload: Function;
  messages?: Message[];
}) {
  function buttons() {
    if (isLoading) {
      return (
        <>
          <Button variant={'outline'} className="mx-2" onClick={() => stop()}>
            <StopIcon className="w-4 h-4 mr-2" />
            <span>Stop Generating</span>
          </Button>
          <Button variant={'outline'} className="mx-2" onClick={() => reload()}>
            <ShareIcon className="w-4 h-4 mr-2" />
            <span>Share</span>
          </Button>
        </>
      );
    }
    if (messages && messages.length > 0) {
      return (
        <Button variant={'outline'} className="mx-2" onClick={() => reload()}>
          <ReloadIcon className="w-4 h-4 mr-2" />
          <span>Regenerate</span>
        </Button>
      );
    }
  }

  return (
    <div className="absolute w-full left-0 top-0 -mt-6 flex my-4 justify-center items-center">
      {buttons()}
    </div>
  );
}
