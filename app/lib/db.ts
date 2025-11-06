import { MongoClient, Db } from "mongodb";

const uri = process.env.DB_CONNECTION_STRING;
const dbName = process.env.DB_NAME;

if (!uri) throw new Error("❌ Missing DB_CONNECTION_STRING in .env");
if (!dbName) throw new Error("❌ Missing DB_NAME in .env");

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

declare global {
  // allow global var in TS
  // this avoids creating multiple connections in dev mode
  // eslint-disable-next-line no-var
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

const options = {};

if (process.env.NODE_ENV === "development") {
  if (!global._mongoClientPromise) {
    client = new MongoClient(uri, options);
    global._mongoClientPromise = client.connect();
  }
  clientPromise = global._mongoClientPromise;
} else {
  client = new MongoClient(uri, options);
  clientPromise = client.connect();
}

export async function getDb(): Promise<Db> {
  const client = await clientPromise;
  return client.db(dbName);
}
