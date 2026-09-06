import { MongoClient, Db } from 'mongodb';

const uri = process.env.MONGODB_URI || '';
const options = {
  maxPoolSize: 10,
  serverSelectionTimeoutMS: 5000,
};

let client: MongoClient | null = null;
let clientPromise: Promise<MongoClient> | null = null;

declare global {
  // eslint-disable-next-line no-var
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

/**
 * MongoDB Connection Pool Manager (Concept #11: SQL vs NoSQL Polyglot Persistence)
 * Connects to MongoDB Atlas for unstructured data (AI Chat History & User Activity Logs).
 */
export async function getMongoClient(): Promise<MongoClient | null> {
  if (!uri) {
    return null;
  }

  try {
    if (process.env.NODE_ENV === 'development') {
      // In development mode, use a global variable to preserve connection across HMR module reloads
      if (!global._mongoClientPromise) {
        client = new MongoClient(uri, options);
        global._mongoClientPromise = client.connect();
      }
      return await global._mongoClientPromise;
    } else {
      // In production mode, use connection pooling
      if (!clientPromise) {
        client = new MongoClient(uri, options);
        clientPromise = client.connect();
      }
      return await clientPromise;
    }
  } catch (error: any) {
    console.warn('\x1b[33m[MongoDB Warning]\x1b[0m Failed to connect to MongoDB Atlas:', error.message);
    return null;
  }
}

/**
 * Returns the MongoDB Database instance
 */
export async function getDatabase(dbName: string = 'edupress_lms'): Promise<Db | null> {
  const client = await getMongoClient();
  if (!client) return null;
  return client.db(dbName);
}
