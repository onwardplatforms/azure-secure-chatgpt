import { db } from './server';
// import { verifyPasswordHash } from './utils';

export const usersContainer = db.database('AzureSecureChat').container('Users');

// async function authenticateUser(
//   username: string,
//   password: string
// ): Promise<boolean> {
//   const query = {
//     query: 'SELECT * FROM Users u WHERE u.username = @username',
//     parameters: [{ name: '@username', value: username }],
//   };
//   const { resources: users } = await usersContainer.items
//     .query(query)
//     .fetchAll();
//   const user = users[0];
//   return user && verifyPasswordHash(password, user.password_hash);
// }

// import { getSession } from 'next-auth/react';

// export async function retrieveUserId(): Promise<string | null> {
//   const userId = (await auth())?.user.id;

//   // If the session exists and the userId is defined, return it.
//   if (userId) return userId;

//   // If no session or no userId is found, return null or handle as needed.
//   return null;
// }
