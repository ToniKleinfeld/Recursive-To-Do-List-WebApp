import { TodoCard } from "./TodoCard";
import type { TodoCard as TodoCardType } from "~/types/card";

interface TodoListProps {
  cards: TodoCardType[];
  onToggle: (rootId: string, targetId: string, isCompleted: boolean) => void;
  onDelete: (rootId: string, targetId: string) => void;
  onEdit: (rootId: string, targetId: string, title: string, description: string) => void;
  onAddSubtask: (rootId: string, parentId: string, title: string) => void;
}

export function TodoList({ cards, onToggle, onDelete, onEdit, onAddSubtask }: TodoListProps) {
  if (cards.length === 0) {
    return (
      <div className="empty-state">
        <p>No tasks found. Create one to get started!</p>
      </div>
    );
  }

  return (
    <div className="todo-list">
      {cards.map((card) => (
        <TodoCard 
          key={card.$id} 
          card={card} 
          rootId={card.$id} 
          depth={0} 
          isRoot={true}
          onToggle={onToggle}
          onDelete={onDelete}
          onEdit={onEdit}
          onAddSubtask={onAddSubtask}
        />
      ))}
    </div>
  );
}
