import { ID, Query, Permission, Role } from "node-appwrite";
import { createSessionClient } from "./appwrite.server";
import type { TodoCard, TodoCardDB } from "~/types/card";

const DB_ID = "todo-db";
const COLLECTION_ID = "cards";

export async function getCards(request: Request, userId: string, search?: string, showCompleted?: boolean) {
  const { databases } = await createSessionClient(request);
  
  let queries = [
    Query.equal("userId", userId),
    Query.orderDesc("$createdAt"),
  ];

  if (search) {
    queries.push(Query.or([
      Query.contains("title", search),
      Query.contains("description", search),
      Query.contains("subtasks", search)
    ]));
  }

  if (showCompleted === false) {
     queries.push(Query.equal("isCompleted", false));
  }

  const result = await databases.listDocuments<TodoCardDB>(
    DB_ID,
    COLLECTION_ID,
    queries
  );

  const cards: TodoCard[] = result.documents.map(doc => {
    let subtasks = [];
    try {
      subtasks = doc.subtasks ? JSON.parse(doc.subtasks) : [];
    } catch (e) {
      console.error("Failed to parse subtasks for card", doc.$id, e);
    }
    return {
      ...doc,
      subtasks
    };
  });

  return cards;
}

export async function createCard(request: Request, data: { title: string; description?: string; userId: string }) {
  const { databases } = await createSessionClient(request);
  
  return databases.createDocument(
    DB_ID,
    COLLECTION_ID,
    ID.unique(),
    {
      title: data.title,
      description: data.description,
      isCompleted: false,
      subtasks: "[]",
      userId: data.userId
    },
    [
      Permission.read(Role.user(data.userId)),
      Permission.update(Role.user(data.userId)),
      Permission.delete(Role.user(data.userId)),
    ]
  );
}

export async function updateCard(request: Request, cardId: string, data: Partial<TodoCard>) {
  const { databases } = await createSessionClient(request);
  
  const updateData: any = { ...data };
  // Remove Appwrite system fields if present
  delete updateData.$id;
  delete updateData.$createdAt;
  delete updateData.$updatedAt;
  delete updateData.$databaseId;
  delete updateData.$collectionId;
  delete updateData.$permissions;

  if (data.subtasks) {
    updateData.subtasks = JSON.stringify(data.subtasks);
  }

  return databases.updateDocument(
    DB_ID,
    COLLECTION_ID,
    cardId,
    updateData
  );
}

export async function deleteCard(request: Request, cardId: string) {
  const { databases } = await createSessionClient(request);
  return databases.deleteDocument(DB_ID, COLLECTION_ID, cardId);
}
