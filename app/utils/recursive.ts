import type { Subtask } from "~/types/card";

export function updateTree(
  subtasks: Subtask[], 
  targetId: string, 
  updater: (task: Subtask) => Subtask | null // Return null to delete
): Subtask[] {
  return subtasks.reduce((acc, task) => {
    if (task.id === targetId) {
      const updated = updater(task);
      if (updated) acc.push(updated);
    } else {
      const updatedSubtasks = updateTree(task.subtasks || [], targetId, updater);
      acc.push({ ...task, subtasks: updatedSubtasks });
    }
    return acc;
  }, [] as Subtask[]);
}

export function findInTree(subtasks: Subtask[], targetId: string): Subtask | null {
  for (const task of subtasks) {
    if (task.id === targetId) return task;
    const found = findInTree(task.subtasks || [], targetId);
    if (found) return found;
  }
  return null;
}

export function addSubtaskToTree(subtasks: Subtask[], parentId: string, newSubtask: Subtask): Subtask[] {
  return subtasks.map(task => {
    if (task.id === parentId) {
      return { ...task, subtasks: [...(task.subtasks || []), newSubtask] };
    }
    if (task.subtasks) {
      return { ...task, subtasks: addSubtaskToTree(task.subtasks, parentId, newSubtask) };
    }
    return task;
  });
}
