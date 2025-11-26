import { Client, Account, Databases, Users } from "node-appwrite";
import { getSession } from "./session.server";

export const ENDPOINT = process.env.VITE_APPWRITE_ENDPOINT!;
export const PROJECT_ID = process.env.VITE_APPWRITE_PROJECT_ID!;

// Select Key based on Environment
// We use ADMIN_KEY for now as it has the required permissions (scopes) to bypass rate limits via Admin API
const API_KEY = process.env.ADMIN_KEY!;

export function createAdminClient() {
  if (!API_KEY) {
    console.error("❌ API_KEY is missing! Check your .env file.");
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

export function createPublicClient() {
  console.log("[Appwrite] Creating Public Client");
  const client = new Client()
    .setEndpoint(ENDPOINT)
    .setProject(PROJECT_ID);

  return {
    get account() {
      return new Account(client);
    },
  };
}

export async function createSessionClient(request: Request) {
  // console.log("[Appwrite] Creating Session Client");
  const client = new Client()
    .setEndpoint(ENDPOINT)
    .setProject(PROJECT_ID);

  const session = await getSession(request.headers.get("Cookie"));
  const token = session.get("token");

  if (!token) {
    // console.warn("[Appwrite] No session token found in cookie");
    throw new Error("No session");
  }

  // console.log("[Appwrite] Session token found (length):", token.length);
  
  // If the token is a JWT (which is long), we use setJWT? No, setSession handles both usually or we need setJWT.
  // Appwrite Node SDK has setSession(string) which sets 'X-Appwrite-Session' header.
  // If we pass a JWT, we should use setJWT(string) which sets 'X-Appwrite-JWT' header.
  
  // Let's check if the token looks like a JWT (contains dots)
  if (token.includes('.') && token.length > 100) {
      client.setJWT(token);
  } else {
      client.setSession(token);
  }

  return {
    get account() {
      return new Account(client);
    },
    get databases() {
      return new Databases(client);
    },
  };
}
