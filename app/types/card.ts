import { Models } from "node-appwrite";

export interface TodoCardDB extends Models.Document {
  title: string;
  description?: string;
  isCompleted: boolean;
  subtasks: string; // JSON string
  userId: string;
}

export interface Subtask {
  id: string;
  title: string;
  description?: string;
  isCompleted: boolean;
  subtasks: Subtask[];
  createdAt: string;
}

export interface TodoCard extends Omit<TodoCardDB, "subtasks"> {
  subtasks: Subtask[];
  depth?: number;
}


