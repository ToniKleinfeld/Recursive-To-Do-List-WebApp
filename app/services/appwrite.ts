import { Client, Account, Databases } from "appwrite";

export const client = new Client();

const ENDPOINT = import.meta.env.VITE_APPWRITE_ENDPOINT;
const PROJECT_ID = import.meta.env.VITE_APPWRITE_PROJECT_ID;

// Use DEV_KEY in development to bypass rate limits if available
// WARNING: Exposing API Keys in the client is generally not recommended for production,
// but acceptable for local development to bypass strict rate limits.
const DEV_KEY = import.meta.env.DEV ? import.meta.env.VITE_DEV_KEY : undefined;

client
    .setEndpoint(ENDPOINT)
    .setProject(PROJECT_ID);

// If we have a DEV_KEY (and are in dev mode), we try to use it?
// The Client SDK (Web) usually doesn't support setKey().
// However, if the user provided a "Dev Key" that is actually an API Key, 
// we can't use it here directly if the SDK doesn't support it.
// BUT, maybe the user meant "Project ID" was the key? No, they said "Dev Key".

// If the Client SDK doesn't support setKey, we can't use it here.
// Let's check if we can use it.
// @ts-ignore - setKey might not be in the type definition for Web SDK but might work or we need a different approach.
if (DEV_KEY && typeof client.setKey === 'function') {
    // @ts-ignore
    client.setKey(DEV_KEY);
}

export const account = new Account(client);
export const databases = new Databases(client);
