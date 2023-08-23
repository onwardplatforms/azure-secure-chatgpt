import { AI_MODELS, ROLES } from '@/lib/constants';
import { addMessageToSessionById, createFirstSession } from '@/lib/sessions';
import { OpenAIStream, StreamingTextResponse, nanoid } from 'ai';
import { Configuration, OpenAIApi } from 'openai-edge';
import { type Message } from 'ai/react';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

const AZURE_OPENAI_API_DEPLOYMENT_NAME =
  process.env.AZURE_OPENAI_API_DEPLOYMENT_NAME;
const AZURE_OPENAI_API_KEY = process.env.AZURE_OPENAI_API_KEY;
const AZURE_OPENAI_API_VERSION = process.env.AZURE_OPENAI_API_VERSION;
const AZURE_OPENAI_API_INSTANCE_NAME =
  process.env.AZURE_OPENAI_API_INSTANCE_NAME;

const endpoint = `https://${
  AZURE_OPENAI_API_INSTANCE_NAME ?? ''
}.openai.azure.com`;

const config = new Configuration({
  basePath: `${endpoint}/openai/deployments/${AZURE_OPENAI_API_DEPLOYMENT_NAME}`,
  defaultQueryParams: new URLSearchParams({
    'api-version': AZURE_OPENAI_API_VERSION ?? '',
  }),
  baseOptions: {
    headers: {
      'api-key': AZURE_OPENAI_API_KEY,
    },
  },
});

const openai = new OpenAIApi(config);

export async function POST(req: NextRequest) {
  const json = await req.json();
  let { messages, id } = json;

  let newSessionCreated = false;

  const userId = '1';

  if (!userId) {
    return new Response('Unauthorized', { status: 401 });
  }

  if (id && messages[messages.length - 1].role !== ROLES.USER) {
    // append message to session
    await addMessageToSessionById({
      sessionId: id,
      userId,
      messages,
      message: messages[messages.length - 1],
      role: ROLES.USER,
    });
  }

  if (!id) {
    id = await createFirstSession({
      aiModel: AI_MODELS.AZURE_GPT3_5_TURBO,
      userId: userId,
      message: messages[0],
    });
    newSessionCreated = true;
  }

  const res = await openai.createChatCompletion({
    model: 'gpt-3.5-turbo',
    messages,
    temperature: 0.7,
    stream: true,
  });

  const stream = OpenAIStream(res, {
    async onCompletion(completion) {
      const messageItem: Message = {
        id: nanoid(), // A unique ID for the message itself
        content: completion,
        role: 'assistant',
      };

      await addMessageToSessionById({
        sessionId: id,
        userId,
        messages: messages,
        message: messageItem,
        role: 'assistant',
      });
    },
  });

  return new StreamingTextResponse(stream, {
    headers: {
      id: newSessionCreated ? id : '',
    },
  });
}
