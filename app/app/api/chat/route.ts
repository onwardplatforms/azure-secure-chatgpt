import { AI_MODELS } from '@/lib/constants';
import {
  Test,
  appendMessageToSessionById,
  createSession,
  wowzers,
} from '@/lib/sessions';
import { OpenAIStream, StreamingTextResponse, nanoid } from 'ai';
import { Configuration, OpenAIApi } from 'openai-edge';
import { type Message } from 'ai/react';

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

export async function POST(req: Request) {
  try {
    console.log('Beginning');
    const json = await req.json();
    const { messages, sessionId } = json;

    const userId = '1';

    if (!userId) {
      return new Response('Unauthorized', { status: 401 });
    }

    const res = await openai.createChatCompletion({
      model: 'gpt-3.5-turbo',
      messages,
      temperature: 0.7,
      stream: true,
    });

    const stream = OpenAIStream(res, {
      async onCompletion(completion) {
        console.log("I'm done!");
        const createdAt = json.createdAt ?? Date.now(); // Session creation timestamp
        const id = json.id; // Session ID
        // const userId = await retrieveUserId(); // User ID associated with the request
        console.log(id, 'id');
        // if (!userId) throw new Error('Unauthorized');
        const messageItem: Message = {
          id: nanoid(), // A unique ID for the message itself
          content: completion,
          role: 'assistant',
        };
        const prevMessage: any = {
          id: nanoid(), // A unique ID for the message itself
          content: json.messages[messages.length - 1].content,
          role: 'user',
        };
        // if (id) {
        //   console.log('id is present');
        //   await appendMessageToSessionById(id, messageItem);
        // }
        // // }
        // console.log('No session id');
        // } else {
        //   // Create a new session
        //   const seshId = await createSession(
        //     userId,
        //     AI_MODELS.AZURE_GPT3_5_TURBO
        //   );
        //   if (!seshId) throw new Error("Couldn't create session");
        //   // find a better way to do this
        //   await appendMessageToSessionById(seshId, messageItem);
        //   await appendMessageToSessionById(seshId, prevMessage);
        //   console.log('shit');
        // }
      },
    });
    return new StreamingTextResponse(stream);
  } catch (err) {
    console.log('Error in POST /api/chat');
  }
}
