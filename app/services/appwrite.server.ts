import { Client, Account, Databases, Users } from "node-appwrite";
import { getSession } from "./session.server";

export const ENDPOINT = process.env.VITE_APPWRITE_ENDPOINT!;
export const PROJECT_ID = process.env.VITE_APPWRITE_PROJECT_ID!;
export const API_KEY = process.env.DEV_KEY!; // Using DEV_KEY as API Key

export function createAdminClient() {
  if (!API_KEY) {
    console.error("❌ API_KEY is missing in createAdminClient!");
  } else {
    console.log("✅ API_KEY loaded. Length:", API_KEY.length);
  }

  const client = new Client()
    .setEndpoint(ENDPOINT)
    .setProject(PROJECT_ID)
    .setKey(API_KEY);

  return {
    get account() {
      return new Account(client);
    },
    get databases() {
      return new Databases(client);
    },
    get users() {
      return new Users(client);
    },
  };
}

export async function createSessionClient(request: Request) {
  const client = new Client()
    .setEndpoint(ENDPOINT)
    .setProject(PROJECT_ID);

  const session = await getSession(request.headers.get("Cookie"));
  const token = session.get("token");

  if (!token) {
    throw new Error("No session");
  }

  client.setSession(token);

  return {
    get account() {
      return new Account(client);
    },
    get databases() {
      return new Databases(client);
    },
  };
}
