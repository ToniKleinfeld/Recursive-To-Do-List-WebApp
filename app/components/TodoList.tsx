import { TodoCard } from "./TodoCard";
import type { TodoCard as TodoCardType } from "~/types/card";

export function TodoList({ cards }: { cards: TodoCardType[] }) {
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
        />
      ))}
    </div>
  );
}
