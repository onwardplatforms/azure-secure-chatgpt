'use server';

// import { db } from './server';
import { usersContainer } from './users';
import { generateNanoid } from './utils';
import { AI_MODELS, ROLES } from './constants';
import { type Message } from 'ai/react';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import Router from 'next/navigation';
import { RedirectType } from 'next/dist/client/components/redirect';

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
  message: Message;
  aiModel: string;
}) {
  const sessionId = generateNanoid();
  const sessionUrl = `${process.env.FUNCTION_APP_ENDPOINT}/users/${userId}/sessions`;

  const sessionBody: Session = {
    id: sessionId,
    title: message.content,
    aiModel: aiModel,
    userId,
    createdAt: Date.now(),
    messages: [
      {
        timestamp: Date.now(),
        //@ts-ignore
        role: ROLES.USER,
        content: message.content,
        id: generateNanoid(),
      },
    ],
  };

  const key = process.env.FUNCTION_KEY;

  if (!key) {
    throw new Error('');
  }

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
  const { id } = sessionData;

  return id;
}

export async function addMessageToSessionById({
  sessionId,
  userId,
  messages,
  message,
  role,
}: {
  sessionId: string;
  userId: string;
  messages: Message[];
  message: Message;
  role: string;
}) {
  // everything must be passed so we will throw an error if it's not
  if (!sessionId || !userId || !messages || !message || !role) {
    throw new Error('Missing required parameters');
  }

  const sessionUrl = `${process.env.FUNCTION_APP_ENDPOINT}/users/${userId}/sessions/${sessionId}`;

  const newMessage = {
    timestamp: Date.now(),
    role,
    content: message.content,
    id: generateNanoid(),
  };

  const key = process.env.FUNCTION_KEY;

  if (!key) {
    throw new Error('');
  }

  const allSessions = await getAllSessionsForUser({ userId });

  const original: Session = await getMessagesForSession({
    sessionId,
    userId,
  });

  if (!original) {
    throw new Error('Session not found');
  }

  // append message to end of messages in document

  const merged = {
    ...original,
    messages: [...messages, newMessage],
  };

  const sessionResponse = await fetch(sessionUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-functions-key': key,
      'x-ms-documentdb-partitionkey': `[${userId}]`,
    },
    body: JSON.stringify(merged),
  });

  if (!sessionResponse.ok) {
    throw new Error(`HTTP error! Status: ${sessionResponse.status}`);
  }

  return sessionId;
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

    revalidatePath('/');

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

    return { ...data, ok: true };
  } catch (error) {
    console.error('Error:', error);
    return {
      ok: false,
      message: 'Session not found',
    };
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
  const url = `${process.env.FUNCTION_APP_ENDPOINT}/users/${userId}/sessions/${sessionId}`;

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
    revalidatePath('/');

    return { ok: true, message: 'Session deleted successfully' };
  } catch (error) {
    console.error('Error:', error);
    return { ok: false, message: 'Error deleting session' };
  }
}
