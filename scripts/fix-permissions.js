import { Client, Databases, Permission, Role } from 'node-appwrite';
import dotenv from 'dotenv';

dotenv.config();

const client = new Client()
    .setEndpoint(process.env.VITE_APPWRITE_ENDPOINT)
    .setProject(process.env.VITE_APPWRITE_PROJECT_ID)
    .setKey(process.env.DEV_KEY);

const databases = new Databases(client);

const DB_ID = 'todo-db';
const COLLECTION_ID = 'cards';

async function fixPermissions() {
    try {
        console.log(`Updating permissions for collection ${COLLECTION_ID}...`);
        
        await databases.updateCollection(
            DB_ID, 
            COLLECTION_ID, 
            'Cards', // Name
            [
                Permission.read(Role.users()),   // All logged in users can read (Document security will filter specific docs)
                Permission.create(Role.users()), // All logged in users can create
                Permission.update(Role.users()), // All logged in users can update
                Permission.delete(Role.users()), // All logged in users can delete
            ]
        );

        console.log('✅ Permissions updated successfully!');
        console.log('Now all logged-in users should be able to access the database.');

    } catch (error) {
        console.error('❌ Failed to update permissions:', error);
    }
}

fixPermissions();
