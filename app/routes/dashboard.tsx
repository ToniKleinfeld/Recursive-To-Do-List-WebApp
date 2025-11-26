import { useLoaderData, useFetcher, redirect, Form, useNavigate, useSearchParams } from "react-router";
import { createSessionClient, createAdminClient } from "~/services/appwrite.server";
import { Query, ID } from "node-appwrite";
import { Header } from "~/components/Header";
import { SearchBar } from "~/components/SearchBar";
import { TodoList } from "~/components/TodoList";
import { updateTree, addSubtaskToTree } from "~/utils/recursive";
import type { Route } from "./+types/dashboard";
import { toast } from "sonner";
import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import type { TodoCard, TodoCardDB } from "~/types/card";

export function meta({}: Route.MetaArgs) {
  return [{ title: "Dashboard - Recursive To-Do" }];
}

export async function loader({ request }: Route.LoaderArgs) {
  try {
    const { account } = await createSessionClient(request);
    const user = await account.get();

    const url = new URL(request.url);
    const q = url.searchParams.get("q");
    const showCompleted = url.searchParams.get("showCompleted") !== "false";

    // Use Admin Client for DB operations to use DEV_KEY if available
    const { databases } = createAdminClient();
    const dbId = process.env.VITE_APPWRITE_DATABASE_ID || "todo-db";
    const colId = process.env.VITE_APPWRITE_COLLECTION_ID || "cards";
    
    const queries = [
      Query.equal("userId", user.$id),
      Query.orderDesc("$createdAt")
    ];

    if (q) {
      queries.push(Query.search("title", q));
    }

    if (!showCompleted) {
      queries.push(Query.equal("isCompleted", false));
    }
    
    const result = await databases.listDocuments<TodoCardDB>(
      dbId,
      colId,
      queries
    );

    const cards = result.documents.map(doc => {
      let subtasks = [];
      try {
        subtasks = doc.subtasks ? JSON.parse(doc.subtasks) : [];
      } catch (e) {
        console.error("Failed to parse subtasks", e);
      }
      return { ...doc, subtasks };
    });

    return { user, cards };
  } catch (error: any) {
    console.error("[Dashboard] Loader Error:", error);
    return redirect("/login");
  }
}

export async function action({ request }: Route.ActionArgs) {
  try {
    const { account } = await createSessionClient(request);
    const user = await account.get();
    const { databases } = createAdminClient();
    
    const formData = await request.formData();
    const intent = formData.get("intent");
    const dbId = process.env.VITE_APPWRITE_DATABASE_ID || "todo-db";
    const colId = process.env.VITE_APPWRITE_COLLECTION_ID || "cards";

    if (intent === "create") {
      const title = formData.get("title") as string;
      const description = formData.get("description") as string;
      
      await databases.createDocument(dbId, colId, ID.unique(), {
        title,
        description,
        isCompleted: false,
        subtasks: "[]",
        userId: user.$id
      });
      return { success: true };
    }
    
    if (intent === "update") {
      const cardId = formData.get("cardId") as string;
      const updatesStr = formData.get("updates") as string;
      const updates = JSON.parse(updatesStr);
      
      // Clean up fields
      delete updates.$id;
      delete updates.$createdAt;
      delete updates.$updatedAt;
      delete updates.$databaseId;
      delete updates.$collectionId;
      delete updates.$permissions;
      
      if (updates.subtasks && typeof updates.subtasks !== 'string') {
          updates.subtasks = JSON.stringify(updates.subtasks);
      }

      await databases.updateDocument(dbId, colId, cardId, updates);
      return { success: true };
    }

    if (intent === "delete") {
      const cardId = formData.get("cardId") as string;
      await databases.deleteDocument(dbId, colId, cardId);
      return { success: true };
    }

    return null;
  } catch (error) {
    console.error("Dashboard Action Error:", error);
    return { error: "Action failed" };
  }
}

export default function Dashboard() {
  const { user, cards: initialCards } = useLoaderData<typeof loader>();
  const fetcher = useFetcher();
  const [cards, setCards] = useState<TodoCard[]>(initialCards);
  const [isCreating, setIsCreating] = useState(false);
  const [searchParams] = useSearchParams();

  const showCompleted = searchParams.get("showCompleted") !== "false";
  const searchQuery = searchParams.get("q") || "";

  // Sync cards when loader data changes (e.g. after action revalidation)
  useEffect(() => {
    setCards(initialCards);
  }, [initialCards]);

  // Filter cards for display based on current state and search params
  // This ensures optimistic updates (like toggling completion) are reflected immediately
  const displayedCards = cards.filter(card => {
    // Filter by completion status
    if (!showCompleted && card.isCompleted) {
      return false;
    }
    
    // Filter by search query (simple client-side check for immediate feedback)
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchesTitle = card.title.toLowerCase().includes(q);
      const matchesDesc = card.description?.toLowerCase().includes(q);
      // Note: This doesn't search deep into subtasks, but the loader does for root titles
      return matchesTitle || matchesDesc;
    }

    return true;
  });

  const handleCreateCard = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const title = formData.get("title") as string;
    const description = formData.get("description") as string;

    fetcher.submit(
      { intent: "create", title, description },
      { method: "post" }
    );
    setIsCreating(false);
    toast.success("Creating card...");
  };

  const handleToggle = (rootId: string, targetId: string, isCompleted: boolean) => {
    const rootCard = cards.find(c => c.$id === rootId);
    if (!rootCard) return;

    let newSubtasks = rootCard.subtasks || [];
    let updates: any = {};

    if (rootId === targetId) {
      updates = { isCompleted };
      // Optimistic
      setCards(cards.map(c => c.$id === rootId ? { ...c, isCompleted } : c));
    } else {
      newSubtasks = updateTree(newSubtasks, targetId, (task) => ({ ...task, isCompleted }));
      updates = { subtasks: newSubtasks };
      // Optimistic
      setCards(cards.map(c => c.$id === rootId ? { ...c, subtasks: newSubtasks } : c));
    }

    fetcher.submit(
      { intent: "update", cardId: rootId, updates: JSON.stringify(updates) },
      { method: "post" }
    );
  };

  const handleDelete = (rootId: string, targetId: string) => {
    const rootCard = cards.find(c => c.$id === rootId);
    if (!rootCard) return;

    if (rootId === targetId) {
      // Optimistic
      setCards(cards.filter(c => c.$id !== rootId));
      fetcher.submit(
        { intent: "delete", cardId: rootId },
        { method: "post" }
      );
    } else {
      const newSubtasks = updateTree(rootCard.subtasks || [], targetId, () => null);
      // Optimistic
      setCards(cards.map(c => c.$id === rootId ? { ...c, subtasks: newSubtasks } : c));
      fetcher.submit(
        { intent: "update", cardId: rootId, updates: JSON.stringify({ subtasks: newSubtasks }) },
        { method: "post" }
      );
    }
  };

  const handleEdit = (rootId: string, targetId: string, title: string, description: string) => {
    const rootCard = cards.find(c => c.$id === rootId);
    if (!rootCard) return;

    let updates: any = {};
    let newSubtasks = rootCard.subtasks || [];

    if (rootId === targetId) {
      updates = { title, description };
      setCards(cards.map(c => c.$id === rootId ? { ...c, title, description } : c));
    } else {
      newSubtasks = updateTree(newSubtasks, targetId, (task) => ({ ...task, title, description }));
      updates = { subtasks: newSubtasks };
      setCards(cards.map(c => c.$id === rootId ? { ...c, subtasks: newSubtasks } : c));
    }

    fetcher.submit(
      { intent: "update", cardId: rootId, updates: JSON.stringify(updates) },
      { method: "post" }
    );
  };

  const handleAddSubtask = (rootId: string, parentId: string, title: string) => {
    const rootCard = cards.find(c => c.$id === rootId);
    if (!rootCard) return;

    const newSubtask = {
      id: ID.unique(),
      title,
      isCompleted: false,
      subtasks: [],
      createdAt: new Date().toISOString()
    };

    let newSubtasks = rootCard.subtasks || [];

    if (rootId === parentId) {
      newSubtasks = [...newSubtasks, newSubtask];
    } else {
      newSubtasks = addSubtaskToTree(newSubtasks, parentId, newSubtask);
    }

    setCards(cards.map(c => c.$id === rootId ? { ...c, subtasks: newSubtasks } : c));
    
    fetcher.submit(
      { intent: "update", cardId: rootId, updates: JSON.stringify({ subtasks: newSubtasks }) },
      { method: "post" }
    );
  };

  return (
    <div className="dashboard-container">
      <Header user={user} />
      
      <main className="main-content">
        <div className="controls-section">
          <SearchBar />
          <button onClick={() => setIsCreating(true)} className="btn-primary create-btn">
            <Plus size={20} /> New Task
          </button>
        </div>

        {isCreating && (
          <div className="create-card-modal">
            <div className="modal-content">
              <h2>Create New Task</h2>
              <form onSubmit={handleCreateCard}>
                <div className="form-group">
                  <label>Title</label>
                  <input type="text" name="title" required autoFocus />
                </div>
                <div className="form-group">
                  <label>Description (Optional)</label>
                  <textarea name="description" rows={3} />
                </div>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-color)', opacity: 0.7, marginBottom: '1rem' }}>
                  You can add subtasks after creating the main task.
                </p>
                <div className="modal-actions">
                  <button type="submit" className="btn-primary">Create</button>
                  <button type="button" onClick={() => setIsCreating(false)} className="btn-secondary">Cancel</button>
                </div>
              </form>
            </div>
          </div>
        )}

        <TodoList 
          cards={displayedCards} 
          onToggle={handleToggle}
          onDelete={handleDelete}
          onEdit={handleEdit}
          onAddSubtask={handleAddSubtask}
        />
      </main>
    </div>
  );
}
