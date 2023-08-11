// server.ts

import { CosmosClient } from '@azure/cosmos';

let db: CosmosClient;

declare global {
  var __db__: CosmosClient | undefined;
}

const endpoint = process.env.COSMOS_ENDPOINT ?? '';
const key = process.env.COSMOS_KEY ?? '';

// This is needed because in development we don't want to restart
// the server with every change, but we want to make sure we don't
// create a new connection to the DB with every change either.
// In production, we'll have a single connection to the DB.
if (process.env.NODE_ENV === 'production') {
  db = new CosmosClient({ endpoint, key });
} else {
  if (!global.__db__) {
    global.__db__ = new CosmosClient({ endpoint, key });
  }
  db = global.__db__;
}

export { db };
