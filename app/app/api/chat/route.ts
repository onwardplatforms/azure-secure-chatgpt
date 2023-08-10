import { OpenAIStream, StreamingTextResponse, nanoid } from 'ai';
import { Configuration, OpenAIApi } from 'openai-edge';

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
    // const userId = (await auth())?.user.id;
    const json = await req.json();
    const { messages } = json;

    const res = await openai.createChatCompletion({
      model: 'gpt-3.5-turbo',
      messages,
      temperature: 0.7,
      stream: true,
    });

    const stream = OpenAIStream(
      res
      //   {
      //   async onCompletion(completion){
      //     const title = json.messages[0].content.substring(0, 100);
      //     const id = json.id ?? nanoid();
      //     const createdAt = Date.now();
      //     const path = `/chat/${id}`;
      //     const payload = {
      //       id,
      //       title,
      //       userId,
      //       createdAt,
      //       path,
      //       messages: [
      //         ...messages,
      //         {
      //           content: completion,
      //           role: 'assistant',
      //         },
      //       ],
      //     };
      //     await kv.hmset(`chat:${id}`, payload);
      //     await kv.zadd(`user:chat:${userId}`, {
      //       score: createdAt,
      //       member: `chat:${id}`,
      //     });
      //   }
      // }
    );
    return new StreamingTextResponse(stream);
  } catch (err) {
    console.log(err);
  }
}
