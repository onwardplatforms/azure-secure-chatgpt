//typescript ignore file
import NextAuth, { type DefaultSession } from 'next-auth';
import GithubProvider from 'next-auth/providers/github';
import AzureProvider from 'next-auth/providers/azure-ad-b2c';

declare module 'next-auth' {
  interface Session {
    user: {
      /** The user's id. */
      id: string;
    } & DefaultSession['user'];
  }
}

// export const {
//   handlers: { GET, POST },
//   auth,
//   CSRF_experimental, // will be removed in future
// } = NextAuth({
//   providers: [
//     GithubProvider({
//       clientId: process.env.GITHUB_CLIENT_ID ?? '',
//       clientSecret: process.env.GITHUB_CLIENT_SECRET ?? '',
//     }),
//     AzureProvider({
//       clientId: process.env.MICROSOFT_CLIENT_ID ?? '',
//       clientSecret: process.env.MICROSOFT_CLIENT_SECRET ?? '',
//     }),
//   ],
//   callbacks: {
//     jwt({ token, profile }) {
//       if (profile) {
//         //@ts-ignore
//         token.id = profile.id;
//         //@ts-ignore
//         token.image = profile.picture;
//       }
//       return token;
//     },

//     //@ts-ignore

//     authorized({ auth }) {
//       return !!auth?.user; // this ensures there is a logged in user for -every- request
//     },
//   },
//   pages: {
//     signIn: '/sign-in', // overrides the next-auth default signin page https://authjs.dev/guides/basics/pages
//   },
// });
