import { Client, Databases, Permission, Role } from 'node-appwrite';
import dotenv from 'dotenv';

dotenv.config();

const client = new Client()
    .setEndpoint(process.env.VITE_APPWRITE_ENDPOINT)
    .setProject(process.env.VITE_APPWRITE_PROJECT_ID)
    .setKey(process.env.DEV_KEY);

const databases = new Databases(client);

const DB_NAME = 'TodoDB';
const DB_ID = 'todo-db';
const COLLECTION_NAME = 'Cards';
const COLLECTION_ID = 'cards';

async function setup() {
    try {
        // 1. Create Database
        try {
            await databases.get(DB_ID);
            console.log(`Database ${DB_NAME} already exists.`);
        } catch (error) {
            console.log(`Creating database ${DB_NAME}...`);
            await databases.create(DB_ID, DB_NAME);
        }

        // 2. Create Collection
        try {
            await databases.getCollection(DB_ID, COLLECTION_ID);
            console.log(`Collection ${COLLECTION_NAME} already exists.`);
        } catch (error) {
            console.log(`Creating collection ${COLLECTION_NAME}...`);
            await databases.createCollection(
                DB_ID, 
                COLLECTION_ID, 
                COLLECTION_NAME,
                [
                    Permission.read(Role.users()), // Users can read (we will filter by userId in query)
                    Permission.create(Role.users()), // Users can create
                    Permission.update(Role.users()), // Users can update
                    Permission.delete(Role.users()), // Users can delete
                ]
            );
        }

        // 3. Create Attributes
        console.log('Checking attributes...');
        
        const attributes = [
            { key: 'title', type: 'string', size: 100, required: true },
            { key: 'description', type: 'string', size: 1000, required: false },
            { key: 'isCompleted', type: 'boolean', required: true, default: false },
            { key: 'subtasks', type: 'string', size: 50000, required: false, default: '[]' }, // JSON string
            { key: 'userId', type: 'string', size: 255, required: true },
        ];

        for (const attr of attributes) {
            try {
                if (attr.type === 'string') {
                    await databases.createStringAttribute(DB_ID, COLLECTION_ID, attr.key, attr.size, attr.required, attr.default);
                } else if (attr.type === 'boolean') {
                    await databases.createBooleanAttribute(DB_ID, COLLECTION_ID, attr.key, attr.required, attr.default);
                }
                console.log(`Attribute ${attr.key} created.`);
            } catch (error) {
                // Attribute likely exists
                console.log(`Attribute ${attr.key} already exists or error: ${error.message}`);
            }
            // Wait a bit because attribute creation is async
            await new Promise(resolve => setTimeout(resolve, 500));
        }

        // 4. Create Indexes
        console.log('Checking indexes...');
        try {
            await databases.createIndex(DB_ID, COLLECTION_ID, 'userId_index', 'key', ['userId']);
            console.log('Index userId_index created.');
        } catch (error) {
            console.log(`Index userId_index already exists or error: ${error.message}`);
        }

        try {
            // Indexing system attribute $createdAt
            await databases.createIndex(DB_ID, COLLECTION_ID, 'createdAt_index', 'key', ['$createdAt'], ['DESC']);
            console.log('Index createdAt_index created.');
        } catch (error) {
            console.log(`Index createdAt_index already exists or error: ${error.message}`);
        }

        console.log('Setup complete!');

    } catch (error) {
        console.error('Setup failed:', error);
    }
}

setup();
