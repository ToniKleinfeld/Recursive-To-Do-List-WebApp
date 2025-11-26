import { describe, it, expect } from "vitest";
import { updateTree, findInTree, addSubtaskToTree } from "./recursive";
import type { Subtask } from "~/types/card";

// Helper to create a simple subtask
const createSubtask = (id: string, title: string, subtasks: Subtask[] = []): Subtask => ({
  id,
  title,
  isCompleted: false,
  subtasks,
  createdAt: new Date().toISOString(),
});

describe("Recursive Utils", () => {
  const mockTree: Subtask[] = [
    createSubtask("1", "Task 1", [
      createSubtask("1.1", "Task 1.1"),
      createSubtask("1.2", "Task 1.2", [
        createSubtask("1.2.1", "Task 1.2.1"),
      ]),
    ]),
    createSubtask("2", "Task 2"),
  ];

  describe("findInTree", () => {
    it("should find a top-level task", () => {
      const result = findInTree(mockTree, "1");
      expect(result).toBeDefined();
      expect(result?.id).toBe("1");
    });

    it("should find a nested task", () => {
      const result = findInTree(mockTree, "1.2.1");
      expect(result).toBeDefined();
      expect(result?.id).toBe("1.2.1");
    });

    it("should return null if task not found", () => {
      const result = findInTree(mockTree, "999");
      expect(result).toBeNull();
    });
  });

  describe("addSubtaskToTree", () => {
    it("should add a subtask to a parent", () => {
      const newSubtask = createSubtask("1.3", "Task 1.3");
      const newTree = addSubtaskToTree(mockTree, "1", newSubtask);
      
      const parent = findInTree(newTree, "1");
      expect(parent?.subtasks).toHaveLength(3);
      expect(parent?.subtasks[2].id).toBe("1.3");
    });

    it("should add a subtask to a nested parent", () => {
      const newSubtask = createSubtask("1.2.2", "Task 1.2.2");
      const newTree = addSubtaskToTree(mockTree, "1.2", newSubtask);
      
      const parent = findInTree(newTree, "1.2");
      expect(parent?.subtasks).toHaveLength(2);
      expect(parent?.subtasks[1].id).toBe("1.2.2");
    });
  });

  describe("updateTree", () => {
    it("should update a task's property", () => {
      const newTree = updateTree(mockTree, "1.1", (task) => ({
        ...task,
        isCompleted: true,
      }));

      const task = findInTree(newTree, "1.1");
      expect(task?.isCompleted).toBe(true);
    });

    it("should delete a task when updater returns null", () => {
      const newTree = updateTree(mockTree, "1.2.1", () => null);
      
      const parent = findInTree(newTree, "1.2");
      expect(parent?.subtasks).toHaveLength(0);
      expect(findInTree(newTree, "1.2.1")).toBeNull();
    });

    it("should not modify tree if target not found", () => {
      const newTree = updateTree(mockTree, "999", (task) => ({ ...task, isCompleted: true }));
      expect(newTree).toEqual(mockTree);
    });
  });
});
