import { db } from './server';
import { usersContainer } from './users';
import { generateNanoid } from './utils';
import { AI_MODELS } from './constants';
import { type Message } from 'ai/react';

export type Session = {
  id: string;
  user_id: string;
  ai_model: string;
  title: string;
  messages: Message[];
};

export function wowzers() {
  console.log('test');
}

// Get a reference to your specific container
export const database = db.database('AzureSecureChat');
export const sessionsContainer = database.container('Sessions');

export async function createSession(
  userId: string,
  aiModel: (typeof AI_MODELS)[keyof typeof AI_MODELS]
): Promise<string | undefined> {
  try {
    const session = {
      id: generateNanoid(),
      title: '',
      user_id: userId,
      ai_model: aiModel,
      messages: [],
    };

    await sessionsContainer.items.create(session);

    console.log(session.id, ' created');

    // // Fetch the user's existing data
    // const { resource: user } = await usersContainer.item(userId).read();

    // // Check if the user has existing sessions, otherwise initialize an empty array
    // const existingSessions = user.sessions || [];

    // // Update the user with the new session ID
    // await usersContainer
    //   .item(userId)
    //   .replace({ ...user, sessions: [...existingSessions, session.id] });

    return session.id;
  } catch (err) {
    console.log('Error creating session');
  }
}

export async function getSessionByUserIdAndSessionId(
  userId: string,
  sessionId: string
): Promise<any> {
  // Fetch the user's existing data
  const { resource: user } = await usersContainer.item(userId).read();

  // Check if the user has existing sessions
  if (!user.sessions || !user.sessions.includes(sessionId)) {
    throw new Error('Session not found for this user');
  }

  // Retrieve the session by its ID
  const { resource: session } = await sessionsContainer.item(sessionId).read();

  return session;
}

export async function deleteSessionById(
  sessionId: string,
  userId: string
): Promise<any> {
  // Fetch the user's existing data
  const { resource: user } = await usersContainer.item(userId).read();

  // Check if the user has existing sessions
  if (!user.sessions || !user.sessions.includes(sessionId)) {
    throw new Error('Session not found for this user');
  }

  // Remove the session ID from the user's list of sessions
  const updatedSessions = user.sessions.filter(
    (id: string) => id !== sessionId
  );

  // Update the user with the new list of session IDs
  await usersContainer
    .item(userId)
    .replace({ ...user, sessions: updatedSessions });

  // Delete the session from the sessions container
  await sessionsContainer.item(sessionId).delete();
}

// export async function getAllSessionsByUserId(userId: string): Promise<any[]> {
//   // Fetch the user's existing data
//   const { resource: user } = await usersContainer.item(userId).read();

//   // Extract the session IDs
//   const sessionIds = user.sessions || [];

//   // Fetch each session by ID and collect the results
//   const sessions = await Promise.all(
//     sessionIds.map((id: string) => sessionsContainer.item(id).read())
//   );

//   // Return the session resources
//   return sessions.map((session) => session.resource);
// }

import { CosmosClient } from '@azure/cosmos';

export async function getUserSessions(userId: string) {
  // Define the query to retrieve all sessions for the given user ID
  try {
    const query = {
      query: 'SELECT * FROM sessions s WHERE s.userId = @userId',
      parameters: [{ name: '@userId', value: userId }],
    };
    const iterator = sessionsContainer.items.query(query);
    const { resources: sessions } = await iterator.fetchAll();

    if (sessions.length === 0) {
      console.log('No sessions found for user');
      return [];
    }

    console.log(`Found ${sessions.length} sessions for user ID: ${userId}`);
    return sessions;
  } catch (err) {
    console.log('Error retrieving sessions for user');
    return [];
  }
}

export async function appendMessageToSessionById(
  sessionId: string,
  message: Message
) {
  const userId = '1';
  // Read the existing session
  const { resource: session } = await sessionsContainer.item(sessionId).read();

  if (!session) {
    throw new Error(`Session with ID ${sessionId} not found`);
  }

  // Validate that the userId matches the userId associated with the session
  if (session.user_id !== userId) {
    throw new Error(
      'User is not authorized to append a message to this session'
    );
  }

  // Append the new message
  if (!session.messages) {
    session.messages = [];
  }
  session.messages.push(message);

  // Replace the session with the updated version
  await sessionsContainer.item(sessionId).replace(session);
}

// PLURAL
export async function appendMessagesToSessionById(
  sessionId: string,
  message: Message
) {
  const userId = '1';
  // Read the existing session
  const { resource: session } = await sessionsContainer.item(sessionId).read();

  if (!session) {
    throw new Error(`Session with ID ${sessionId} not found`);
  }

  // Validate that the userId matches the userId associated with the session
  if (session.user_id !== userId) {
    throw new Error(
      'User is not authorized to append a message to this session'
    );
  }

  // Append the new message
  if (!session.messages) {
    session.messages = [];
  }
  session.messages.push(message);

  // Replace the session with the updated version
  await sessionsContainer.item(sessionId).replace(session);
}

export async function getMessagesInSession(sessionId: string, userId: string) {
  // Read the session by its ID
  const { resource: session } = await sessionsContainer.item(sessionId).read();

  // check if that session belongs to the user id passed in
  if (session.user_id !== userId) {
    throw new Error(
      'User is not authorized to retrieve messages from this session'
    );
  }

  // Extract the messages
  const messages = session.messages;

  console.log(
    `Retrieved ${messages.length} messages for session ID: ${sessionId}`
  );
  return messages;
}
