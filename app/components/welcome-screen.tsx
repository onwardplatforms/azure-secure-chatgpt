import { UseChatHelpers } from 'ai/react';

import { Button } from '@/components/ui/button';
import { ExternalLink } from '@/components/external-link';
import { ArrowRight } from 'lucide-react';

const exampleMessages = [
  {
    heading: 'Explain technical concepts',
    message: `What is a "serverless function"?`,
  },
  {
    heading: 'Summarize an article',
    message: 'Summarize the following article as succinctly as you can: \n',
  },
  {
    heading: 'Draft an email',
    message: `Help me draft an email about the following: \n`,
  },
];

export function WelcomeScreen({ setInput }: Pick<UseChatHelpers, 'setInput'>) {
  return (
    <div className="mx-auto max-w-2xl my-4">
      <div className="rounded-lg border bg-background p-8">
        <h1 className="mb-2 text-lg font-semibold">
          What can I assist you with?
        </h1>
        <p className="text-muted-foreground">
          Choose an option below to get started or type your own message in the
          input box
        </p>
        <div className="mt-4 flex flex-col items-start space-y-2">
          {exampleMessages.map((message, index) => (
            <Button
              key={index}
              variant="link"
              className="h-auto p-0 text-base"
              onClick={() => setInput(message.message)}
            >
              <ArrowRight className="mr-2 text-muted-foreground" />
              {message.heading}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}
