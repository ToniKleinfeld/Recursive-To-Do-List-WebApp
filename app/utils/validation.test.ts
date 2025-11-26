import { describe, it, expect } from "vitest";
import { validateEmail, validatePassword, validateName, validatePasswordMatch } from "./validation";

describe("Validation Utils", () => {
  describe("validateEmail", () => {
    it("should return undefined for valid email", () => {
      expect(validateEmail("test@example.com")).toBeUndefined();
    });

    it("should return error for invalid email", () => {
      expect(validateEmail("invalid-email")).toBe("Invalid email address");
      expect(validateEmail("")).toBe("Invalid email address");
      expect(validateEmail(123)).toBe("Invalid email address");
    });
  });

  describe("validatePassword", () => {
    it("should return undefined for valid password", () => {
      expect(validatePassword("password123")).toBeUndefined();
    });

    it("should return error for short password", () => {
      expect(validatePassword("short")).toBe("Password must be at least 8 characters long");
    });

    it("should return error for non-string password", () => {
      expect(validatePassword(12345678)).toBe("Password must be at least 8 characters long");
    });
  });

  describe("validateName", () => {
    it("should return undefined for valid name", () => {
      expect(validateName("John Doe")).toBeUndefined();
    });

    it("should return error for empty name", () => {
      expect(validateName("")).toBe("Name is required");
    });
  });

  describe("validatePasswordMatch", () => {
    it("should return undefined when passwords match", () => {
      expect(validatePasswordMatch("password", "password")).toBeUndefined();
    });

    it("should return error when passwords do not match", () => {
      expect(validatePasswordMatch("password", "different")).toBe("Passwords do not match");
    });
  });
});
