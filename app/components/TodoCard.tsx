import { useState } from "react";
import { ChevronDown, ChevronRight, Check, Trash2, Plus, Edit2, X, Save } from "lucide-react";
import type { TodoCard as TodoCardType, Subtask } from "~/types/card";
import { MAX_SUBTASK_DEPTH } from "~/constants";
import clsx from "clsx";

interface TodoCardProps {
  card: TodoCardType | Subtask;
  rootId: string;
  depth: number;
  isRoot?: boolean;
  showCompleted?: boolean;
  onToggle: (rootId: string, targetId: string, isCompleted: boolean) => void;
  onDelete: (rootId: string, targetId: string) => void;
  onEdit: (rootId: string, targetId: string, title: string, description: string) => void;
  onAddSubtask: (rootId: string, parentId: string, title: string) => void;
}

export function TodoCard({ card, rootId, depth, isRoot = false, showCompleted = true, onToggle, onDelete, onEdit, onAddSubtask }: TodoCardProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isAddingSubtask, setIsAddingSubtask] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const id = isRoot ? (card as TodoCardType).$id : (card as Subtask).id;
  const isCompleted = card.isCompleted;
  const subtasks = card.subtasks || [];
  
  // Filter subtasks for display
  const displayedSubtasks = subtasks.filter(s => showCompleted || !s.isCompleted);
  
  const completedCount = subtasks.filter(s => s.isCompleted).length;
  const totalCount = subtasks.length;
  const progress = totalCount > 0 ? `${completedCount}/${totalCount}` : "";

  const handleToggle = () => {
    onToggle(rootId, id, !isCompleted);
  };

  const handleDeleteClick = () => {
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    onDelete(rootId, id);
    setShowDeleteModal(false);
  };

  const handleSaveEdit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    onEdit(rootId, id, title, description);
    setIsEditing(false);
  };

  const handleAddSubtask = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const title = formData.get("title") as string;
    onAddSubtask(rootId, id, title);
    setIsAddingSubtask(false);
    setIsExpanded(true);
  };

  return (
    <div className={clsx("todo-card-wrapper", { "root-card": isRoot })}>
      <div className={clsx("todo-card", { "completed": isCompleted })}>
        <div className="card-header">
          <div className="left-section">
            <button 
              className={clsx("checkbox", { checked: isCompleted })} 
              onClick={handleToggle}
              aria-label="Toggle completion"
            >
              {isCompleted && <Check size={14} />}
            </button>
            
            {subtasks.length > 0 && (
              <button 
                className="expand-btn" 
                onClick={() => setIsExpanded(!isExpanded)}
                aria-label={isExpanded ? "Collapse" : "Expand"}
              >
                {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
              </button>
            )}
          </div>

          <div className="content-section">
            {isEditing ? (
              <form onSubmit={handleSaveEdit} className="edit-form">
                <input 
                  type="text" 
                  name="title" 
                  defaultValue={card.title} 
                  required 
                  autoFocus 
                  className="edit-input"
                />
                <textarea 
                  name="description" 
                  defaultValue={card.description} 
                  className="edit-textarea"
                  placeholder="Description (optional)"
                />
                <div className="edit-actions">
                  <button type="submit" className="save-btn"><Save size={16} /></button>
                  <button type="button" onClick={() => setIsEditing(false)} className="cancel-btn"><X size={16} /></button>
                </div>
              </form>
            ) : (
              <div className="card-info">
                <h3 className="card-title">{card.title}</h3>
                {card.description && <p className="card-description">{card.description}</p>}
                {progress && <span className="progress-badge">{progress} completed</span>}
              </div>
            )}
          </div>

          <div className="actions-section">
            {!isEditing && (
              <>
                {depth < MAX_SUBTASK_DEPTH && (
                  <button 
                    onClick={() => setIsAddingSubtask(true)} 
                    className="action-btn add-subtask-btn" 
                    aria-label="Add Subtask"
                  >
                    <Plus size={16} />
                    <span>Add Subtask</span>
                  </button>
                )}
                <button onClick={() => setIsEditing(true)} className="action-btn" aria-label="Edit">
                  <Edit2 size={16} />
                </button>
                <button onClick={handleDeleteClick} className="action-btn delete" aria-label="Delete">
                  <Trash2 size={16} />
                </button>
              </>
            )}
          </div>
        </div>

        {isAddingSubtask && (
          <div className="add-subtask-form-wrapper">
            <form onSubmit={handleAddSubtask} className="add-subtask-form">
              <input type="text" name="title" placeholder="New subtask title" required className="subtask-input" autoFocus />
              <div className="form-actions">
                <button type="submit" className="btn-small">Add</button>
                <button type="button" onClick={() => setIsAddingSubtask(false)} className="btn-small cancel">Cancel</button>
              </div>
            </form>
          </div>
        )}
      </div>

      {isExpanded && displayedSubtasks.length > 0 && (
        <div className="subtasks-list">
          {displayedSubtasks.map((subtask) => (
            <TodoCard 
              key={subtask.id} 
              card={subtask} 
              rootId={rootId} 
              depth={depth + 1} 
              showCompleted={showCompleted}
              onToggle={onToggle}
              onDelete={onDelete}
              onEdit={onEdit}
              onAddSubtask={onAddSubtask}
            />
          ))}
        </div>
      )}

      {showDeleteModal && (
        <div className="delete-modal-overlay">
          <div className="delete-modal">
            <h3>Delete Task?</h3>
            <p>Are you sure you want to delete "{card.title}"?</p>
            <div className="modal-actions">
              <button onClick={confirmDelete} className="btn-danger">Delete</button>
              <button onClick={() => setShowDeleteModal(false)} className="btn-secondary">Back</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
