import { useNavigate } from "react-router";
import { account } from "~/services/appwrite";
import { getCards, createCard, updateCard, deleteCard } from "~/services/api";
import { Header } from "~/components/Header";
import { SearchBar } from "~/components/SearchBar";
import { TodoList } from "~/components/TodoList";
import { updateTree, addSubtaskToTree } from "~/utils/recursive";
import type { Route } from "./+types/dashboard";
import { ID } from "appwrite";
import { toast } from "sonner";
import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import type { TodoCard } from "~/types/card";

export function meta({}: Route.MetaArgs) {
  return [{ title: "Dashboard - Recursive To-Do" }];
}

export default function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [cards, setCards] = useState<TodoCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);

  // Load User and Cards
  useEffect(() => {
    const init = async () => {
      try {
        const currentUser = await account.get();
        setUser(currentUser);
        const userCards = await getCards(currentUser.$id);
        setCards(userCards);
      } catch (error) {
        console.error("Auth check failed:", error);
        navigate("/login");
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [navigate]);

  const handleCreateCard = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const title = formData.get("title") as string;
    const description = formData.get("description") as string;

    try {
      await createCard({ title, description, userId: user.$id });
      toast.success("Card created");
      setIsCreating(false);
      // Refresh cards
      const updatedCards = await getCards(user.$id);
      setCards(updatedCards);
    } catch (error: any) {
      toast.error(error.message);
    }
  };

// ...existing code...
  const handleToggle = async (rootId: string, targetId: string, isCompleted: boolean) => {
    try {
      const rootCard = cards.find(c => c.$id === rootId);
      if (!rootCard) return;

      let newSubtasks = rootCard.subtasks || [];
      
      if (rootId === targetId) {
        await updateCard(rootId, { isCompleted });
        // Optimistic update
        setCards(cards.map(c => c.$id === rootId ? { ...c, isCompleted } : c));
      } else {
        newSubtasks = updateTree(newSubtasks, targetId, (task) => ({ ...task, isCompleted }));
        await updateCard(rootId, { subtasks: newSubtasks });
        // Optimistic update
        setCards(cards.map(c => c.$id === rootId ? { ...c, subtasks: newSubtasks } : c));
      }
    } catch (error: any) {
      toast.error("Failed to update task");
    }
  };

  const handleDelete = async (rootId: string, targetId: string) => {
    try {
      const rootCard = cards.find(c => c.$id === rootId);
      if (!rootCard) return;

      if (rootId === targetId) {
        await deleteCard(rootId);
        setCards(cards.filter(c => c.$id !== rootId));
      } else {
        const newSubtasks = updateTree(rootCard.subtasks || [], targetId, () => null);
        await updateCard(rootId, { subtasks: newSubtasks });
        setCards(cards.map(c => c.$id === rootId ? { ...c, subtasks: newSubtasks } : c));
      }
      toast.success("Task deleted");
    } catch (error: any) {
      toast.error("Failed to delete task");
    }
  };

  const handleEdit = async (rootId: string, targetId: string, title: string, description: string) => {
    try {
      const rootCard = cards.find(c => c.$id === rootId);
      if (!rootCard) return;

      if (rootId === targetId) {
        await updateCard(rootId, { title, description });
        setCards(cards.map(c => c.$id === rootId ? { ...c, title, description } : c));
      } else {
        const newSubtasks = updateTree(rootCard.subtasks || [], targetId, (task) => ({ ...task, title, description }));
        await updateCard(rootId, { subtasks: newSubtasks });
        setCards(cards.map(c => c.$id === rootId ? { ...c, subtasks: newSubtasks } : c));
      }
      toast.success("Task updated");
    } catch (error: any) {
      toast.error("Failed to update task");
    }
  };

  const handleAddSubtask = async (rootId: string, parentId: string, title: string) => {
    try {
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

      await updateCard(rootId, { subtasks: newSubtasks });
      setCards(cards.map(c => c.$id === rootId ? { ...c, subtasks: newSubtasks } : c));
      toast.success("Subtask added");
    } catch (error: any) {
      toast.error("Failed to add subtask");
    }
  };

  if (loading) return <div className="p-8 text-center">Loading...</div>;

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
                <div className="modal-actions">
                  <button type="submit" className="btn-primary">Create</button>
                  <button type="button" onClick={() => setIsCreating(false)} className="btn-secondary">Cancel</button>
                </div>
              </form>
            </div>
          </div>
        )}

        <TodoList 
          cards={cards} 
          onToggle={handleToggle}
          onDelete={handleDelete}
          onEdit={handleEdit}
          onAddSubtask={handleAddSubtask}
        />
      </main>
    </div>
  );
}
