'use server';

// import { db } from './server';
import { usersContainer } from './users';
import { generateNanoid } from './utils';
import { AI_MODELS, ROLES } from './constants';
import { type Message } from 'ai/react';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';

export type Session = {
  id: string;
  title: string;
  aiModel: string;
  userId: string;
  createdAt: number;
  messages: Message[];
};

// /users/{userId}/sessions/{sessionId} CREATE
export async function createFirstSession({
  userId,
  message,
  aiModel = 'gpt-3.5-turbo',
}: {
  userId: string;
  message: string;
  aiModel: string;
}) {
  const sessionId = generateNanoid();

  const sessionUrl = `${process.env.FUNCTION_APP_ENDPOINT}/users/${userId}/sessions/create`;

  const sessionBody: Session = {
    id: sessionId,
    title: 'Title of chat.',
    aiModel: aiModel,
    userId,
    createdAt: Date.now(),
    messages: [
      {
        timestamp: Date.now(),
        //@ts-ignore
        role: ROLES.USER,
        content: message,
      },
    ],
  };

  const key = process.env.FUNCTION_KEY;

  if (!key) {
    throw new Error('');
  }

  try {
    const sessionResponse = await fetch(sessionUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-functions-key': key,
        'x-ms-documentdb-partitionkey': `[${userId}]`,
      },
      body: JSON.stringify(sessionBody),
    });

    if (!sessionResponse.ok) {
      throw new Error(`HTTP error! Status: ${sessionResponse.status}`);
    }

    const sessionData = await sessionResponse.json();

    return sessionId;
  } catch (error) {
    console.log("SHIT didn't work creating session");
    console.error('Error:', error);
  }
}

export async function addMessageToSessionById({
  sessionId,
  userId,
  message,
  role,
}: any) {
  const sessionUrl = `${process.env.FUNCTION_APP_ENDPOINT}/users/${userId}/sessions/${sessionId}/message`;

  const sessionBody = {
    timestamp: Date.now(),
    role,
    content: message,
  };

  const key = process.env.FUNCTION_KEY;

  if (!key) {
    throw new Error('');
  }

  try {
    const sessionResponse = await fetch(sessionUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-functions-key': key,
        'x-ms-documentdb-partitionkey': `[${userId}]`,
      },
      body: JSON.stringify(sessionBody),
    });

    if (!sessionResponse.ok) {
      throw new Error(`HTTP error! Status: ${sessionResponse.status}`);
    }

    const sessionData = await sessionResponse.json();

    return sessionId;
  } catch (error) {
    console.log("SHIT didn't work creating session");
    console.error('Error:', error);
  }
}

export async function getAllSessionsForUser({ userId }: { userId: string }) {
  const url = `${process.env.FUNCTION_APP_ENDPOINT}/users/${userId}/sessions`;

  if (!userId) throw new Error('No userId provided');
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'x-functions-key': process.env.FUNCTION_KEY!,
        'x-ms-documentdb-partitionkey': `['${userId}']`,
      },
    });

    if (!response.ok) {
      const rawResponse = await response.text();
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const jsonData: Session[] = await response.json();

    const sortedByCreatedDate = jsonData.sort((a, b) => {
      if (!a.createdAt || !b.createdAt) return 0;

      return b.createdAt - a.createdAt;
    });

    return sortedByCreatedDate;
  } catch (error) {
    console.error('Error:', error);
  }
}

export async function getMessagesForSession({
  sessionId,
  userId,
}: {
  sessionId: string;
  userId: string;
}) {
  // this gets all the sessions by id but how do I get just 1 session by the session id
  const url = `${process.env.FUNCTION_APP_ENDPOINT}/users/${userId}/sessions/${sessionId}`;

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'x-functions-key': process.env.FUNCTION_KEY!,
        'x-ms-documentdb-partitionkey': `[${userId}]`,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();

    return data;
  } catch (error) {
    console.error('Error:', error);
  }
}

export async function deleteSessionById({
  sessionId,
  userId,
}: {
  sessionId: string;
  userId: string;
}) {
  // this gets all the sessions by id but how do I get just 1 session by the session id
  const url = `${process.env.FUNCTION_APP_ENDPOINT}/users/${userId}/sessions/${sessionId}/delete`;
  console.log(url);

  try {
    const response = await fetch(url, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'x-functions-key': process.env.FUNCTION_KEY!,
        'x-ms-documentdb-partitionkey': `[${userId}]`,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    console.log('Session deleted successfully');
    revalidatePath('/');

    return { ok: true, message: 'Session deleted successfully' };
  } catch (error) {
    console.error('Error:', error);
    return { ok: false, message: 'Error deleting session' };
  }
}

// export async function appendMessageToSession({
//   userId,
//   message,
//   sessionId,
// }: {
//   userId: string;
//   message: string;
//   sessionId: string;
// }) {
//   // fetch the entire doc

//   const url = `${process.env.FUNCTION_APP_ENDPOINT}?action=update`;

//   const body = {
//     id: sessionId,
//     title: 'Title of chat.',
//     user: {
//       id: userId,
//       username: '',
//       email: '',
//     },
//     messages: [
//       {
//         timestamp: Date.now(),
//         sender: ROLES.USER,
//         message,
//       },
//     ],
//   };

//   const key = process.env.FUNCTION_KEY;

//   if (!key) {
//     throw new Error('');
//   }

//   try {
//     const response = await fetch(url, {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json',
//         'x-functions-key': process.env.FUNCTION_KEY!,
//         'x-ms-documentdb-partitionkey': `['${userId}']`,
//       },
//       body: JSON.stringify(body),
//     });

//     if (!response.ok) {
//       throw new Error(`HTTP error! Status: ${response.status}`);
//     }

//     const data = await response.json();
//     console.log(data);
//     return sessionId;
//   } catch (error) {
//     console.error('Error:', error);
//   }
// }

// export async function retrieveSessionById({
//   id = 'E7lY1BwzPtXjdwcV3WjCp',
// }: {
//   id: string;
// }) {
//   const url = `${process.env.FUNCTION_APP_ENDPOINT}?action=read&id=${id}&partitionKey=${id}'`;

//   if (!id) throw new Error('No id provided');
//   try {
//     const response = await fetch(url, {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json',
//         'x-functions-key': process.env.FUNCTION_KEY!,
//         'x-ms-documentdb-partitionkey': `['${userId}']`,
//       },
//       body: JSON.stringify(body),
//     });

//     if (!response.ok) {
//       throw new Error(`HTTP error! Status: ${response.status}`);
//     }

//     const data = await response.json();
//     console.log(data);
//     return sessionId;
//   } catch (error) {
//     console.error('Error:', error);
//   }
// }

// export async function sendUserMessage({ sessionId, userId, title, message }) {
//   await fetch(process.env.FUNCTION_APP_ENDPOINT + sessionId + '/inputs', {
//     method: 'POST',
//     headers: {
//       'Content-Type': 'application/json',
//     },
//     body: JSON.stringify({
//       text: message,
//     }),
//   });
// }

// export function sendAIMessage({ sessionId, title, message }) {
//   fetch('https://api.aidungeon.io/sessions/' + sessionId + '/inputs', {
//     method: 'POST',
//     headers: {
//       'Content-Type': 'application/json',
//     },
//     body: JSON.stringify({
//       text: message,
//     }),
//   });
// }

// export const sessionsId = 'sessions';

// // Get a reference to your specific container
// export const database = db.databases.createIfNotExists({ id: databaseId });
// export const sessionsContainer = db
//   .database(databaseId)
//   .containers.createIfNotExists({ id: sessionsId });

// export async function createSession(
//   userId: string,
//   aiModel: (typeof AI_MODELS)[keyof typeof AI_MODELS]
// ): Promise<string | undefined> {
//   try {
//     const session = {
//       id: generateNanoid(),
//       title: '',
//       user_id: userId,
//       ai_model: aiModel,
//       messages: [],
//     };

//     const { items } = await db
//       .database('AzureSecureChat')
//       .container('sessions');

//     const res = await items.readAll();

//     console.log(res);

//     // // Fetch the user's existing data
//     // const { resource: user } = await usersContainer.item(userId).read();

//     // // Check if the user has existing sessions, otherwise initialize an empty array
//     // const existingSessions = user.sessions || [];

//     // // Update the user with the new session ID
//     // await usersContainer
//     //   .item(userId)
//     //   .replace({ ...user, sessions: [...existingSessions, session.id] });

//     return session.id;
//   } catch (err) {
//     console.log('Error creating session');
//   }
// }

// export async function getSessionByUserIdAndSessionId(
//   userId: string,
//   sessionId: string
// ): Promise<any> {
//   // Fetch the user's existing data
//   const { resource: user } = await usersContainer.item(userId).read();

//   // Check if the user has existing sessions
//   if (!user.sessions || !user.sessions.includes(sessionId)) {
//     throw new Error('Session not found for this user');
//   }

//   // Retrieve the session by its ID
//   const { resource: session } = await sessionsContainer.item(sessionId).read();

//   return session;
// }

// export async function deleteSessionById(
//   sessionId: string,
//   userId: string
// ): Promise<any> {
//   // Fetch the user's existing data
//   const { resource: user } = await usersContainer.item(userId).read();

//   // Check if the user has existing sessions
//   if (!user.sessions || !user.sessions.includes(sessionId)) {
//     throw new Error('Session not found for this user');
//   }

//   // Remove the session ID from the user's list of sessions
//   const updatedSessions = user.sessions.filter(
//     (id: string) => id !== sessionId
//   );

//   // Update the user with the new list of session IDs
//   await usersContainer
//     .item(userId)
//     .replace({ ...user, sessions: updatedSessions });

//   // Delete the session from the sessions container
//   await sessionsContainer.item(sessionId).delete();
// }

// // export async function getAllSessionsByUserId(userId: string): Promise<any[]> {
// //   // Fetch the user's existing data
// //   const { resource: user } = await usersContainer.item(userId).read();

// //   // Extract the session IDs
// //   const sessionIds = user.sessions || [];

// //   // Fetch each session by ID and collect the results
// //   const sessions = await Promise.all(
// //     sessionIds.map((id: string) => sessionsContainer.item(id).read())
// //   );

// //   // Return the session resources
// //   return sessions.map((session) => session.resource);
// // }

// import { CosmosClient } from '@azure/cosmos';

// export async function getUserSessions(userId: string) {
//   // Define the query to retrieve all sessions for the given user ID
//   try {
//     const query = {
//       query: 'SELECT * FROM sessions s WHERE s.userId = @userId',
//       parameters: [{ name: '@userId', value: userId }],
//     };
//     const iterator = sessionsContainer.items.query(query);
//     const { resources: sessions } = await iterator.fetchAll();

//     if (sessions.length === 0) {
//       console.log('No sessions found for user');
//       return [];
//     }

//     console.log(`Found ${sessions.length} sessions for user ID: ${userId}`);
//     return sessions;
//   } catch (err) {
//     console.log('Error retrieving sessions for user');
//     return [];
//   }
// }

// export async function appendMessageToSessionById(
//   sessionId: string,
//   message: Message
// ) {
//   const userId = '1';
//   // Read the existing session
//   const { resource: session } = await sessionsContainer.item(sessionId).read();

//   if (!session) {
//     throw new Error(`Session with ID ${sessionId} not found`);
//   }

//   // Validate that the userId matches the userId associated with the session
//   if (session.user_id !== userId) {
//     throw new Error(
//       'User is not authorized to append a message to this session'
//     );
//   }

//   // Append the new message
//   if (!session.messages) {
//     session.messages = [];
//   }
//   session.messages.push(message);

//   // Replace the session with the updated version
//   await sessionsContainer.item(sessionId).replace(session);
// }

// // PLURAL
// export async function appendMessagesToSessionById(
//   sessionId: string,
//   message: Message
// ) {
//   const userId = '1';
//   // Read the existing session
//   const { resource: session } = await sessionsContainer.item(sessionId).read();

//   if (!session) {
//     throw new Error(`Session with ID ${sessionId} not found`);
//   }

//   // Validate that the userId matches the userId associated with the session
//   if (session.user_id !== userId) {
//     throw new Error(
//       'User is not authorized to append a message to this session'
//     );
//   }

//   // Append the new message
//   if (!session.messages) {
//     session.messages = [];
//   }
//   session.messages.push(message);

//   // Replace the session with the updated version
//   await sessionsContainer.item(sessionId).replace(session);
// }

// export async function getMessagesInSession(sessionId: string, userId: string) {
//   // Read the session by its ID
//   const { resource: session } = await sessionsContainer.item(sessionId).read();

//   // check if that session belongs to the user id passed in
//   if (session.user_id !== userId) {
//     throw new Error(
//       'User is not authorized to retrieve messages from this session'
//     );
//   }

//   // Extract the messages
//   const messages = session.messages;

//   console.log(
//     `Retrieved ${messages.length} messages for session ID: ${sessionId}`
//   );
//   return messages;
// }
