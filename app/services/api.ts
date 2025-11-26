import { ID, Query, Permission, Role } from "appwrite";
import { databases } from "./appwrite";
import type { TodoCard, TodoCardDB } from "~/types/card";

const DB_ID = "todo-db";
const COLLECTION_ID = "cards";

export async function getCards(userId: string, search?: string, showCompleted?: boolean) {
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

export async function createCard(data: { title: string; description?: string; userId: string }) {
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

export async function updateCard(cardId: string, data: Partial<TodoCard>) {
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

export async function deleteCard(cardId: string) {
  return databases.deleteDocument(DB_ID, COLLECTION_ID, cardId);
}
