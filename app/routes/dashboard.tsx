import { useLoaderData, Form, useNavigation, useActionData } from "react-router";
import { requireUser } from "~/services/session.server";
import { createSessionClient } from "~/services/appwrite.server";
import { getCards, createCard, updateCard, deleteCard } from "~/services/cards.server";
import { Header } from "~/components/Header";
import { SearchBar } from "~/components/SearchBar";
import { TodoList } from "~/components/TodoList";
import { updateTree, addSubtaskToTree } from "~/utils/recursive";
import type { Route } from "./+types/dashboard";
import { ID } from "node-appwrite";
import { toast } from "sonner";
import { useEffect, useState } from "react";
import { Plus } from "lucide-react";

export function meta({}: Route.MetaArgs) {
  return [{ title: "Dashboard - Recursive To-Do" }];
}

export async function loader({ request }: Route.LoaderArgs) {
  const token = await requireUser(request);
  const { account } = await createSessionClient(request);
  const user = await account.get();
  
  const url = new URL(request.url);
  const search = url.searchParams.get("q") || undefined;
  const showCompleted = url.searchParams.get("showCompleted") !== "false";

  const cards = await getCards(request, user.$id, search, showCompleted);
  return { user, cards };
}

export async function action({ request }: Route.ActionArgs) {
  const token = await requireUser(request);
  const formData = await request.formData();
  const intent = formData.get("intent");
  const { account, databases } = await createSessionClient(request);
  const user = await account.get();

  try {
    if (intent === "create-card") {
      const title = formData.get("title") as string;
      const description = formData.get("description") as string;
      await createCard(request, { title, description, userId: user.$id });
      return { success: true, message: "Card created" };
    }

    const rootId = formData.get("rootId") as string;
    const targetId = formData.get("targetId") as string;

    // Fetch the root card first
    const rootCard = await databases.getDocument("todo-db", "cards", rootId);
    let subtasks = rootCard.subtasks ? JSON.parse(rootCard.subtasks) : [];

    if (intent === "toggle") {
      const isCompleted = formData.get("isCompleted") === "true";
      
      if (rootId === targetId) {
        await updateCard(request, rootId, { isCompleted });
      } else {
        const newSubtasks = updateTree(subtasks, targetId, (task) => ({ ...task, isCompleted }));
        await updateCard(request, rootId, { subtasks: newSubtasks });
      }
      return { success: true };
    }

    if (intent === "delete") {
      if (rootId === targetId) {
        await deleteCard(request, rootId);
      } else {
        const newSubtasks = updateTree(subtasks, targetId, () => null);
        await updateCard(request, rootId, { subtasks: newSubtasks });
      }
      return { success: true, message: "Task deleted" };
    }

    if (intent === "edit") {
      const title = formData.get("title") as string;
      const description = formData.get("description") as string;

      if (rootId === targetId) {
        await updateCard(request, rootId, { title, description });
      } else {
        const newSubtasks = updateTree(subtasks, targetId, (task) => ({ ...task, title, description }));
        await updateCard(request, rootId, { subtasks: newSubtasks });
      }
      return { success: true, message: "Task updated" };
    }

    if (intent === "add-subtask") {
      const parentId = formData.get("parentId") as string;
      const title = formData.get("title") as string;
      
      const newSubtask = {
        id: ID.unique(),
        title,
        isCompleted: false,
        subtasks: [],
        createdAt: new Date().toISOString()
      };

      if (rootId === parentId) {
        subtasks.push(newSubtask);
        await updateCard(request, rootId, { subtasks });
      } else {
        const newSubtasks = addSubtaskToTree(subtasks, parentId, newSubtask);
        await updateCard(request, rootId, { subtasks: newSubtasks });
      }
      return { success: true, message: "Subtask added" };
    }
  } catch (error: any) {
    console.error("Action Error:", error);
    return { success: false, message: error.message || "Something went wrong" };
  }

  return null;
}

export default function Dashboard() {
  const { user, cards } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    if (actionData?.message) {
      if (actionData.success) {
        toast.success(actionData.message);
        if (actionData.message === "Card created") setIsCreating(false);
      } else {
        toast.error(actionData.message);
      }
    }
  }, [actionData]);

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
              <Form method="post">
                <input type="hidden" name="intent" value="create-card" />
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
              </Form>
            </div>
          </div>
        )}

        <TodoList cards={cards} />
      </main>
    </div>
  );
}
