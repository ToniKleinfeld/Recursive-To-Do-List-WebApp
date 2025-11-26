export function validateEmail(email: unknown): string | undefined {
  if (typeof email !== "string" || email.length < 3 || !email.includes("@")) {
    return "Invalid email address";
  }
}

export function validatePassword(password: unknown): string | undefined {
  if (typeof password !== "string" || password.length < 8) {
    return "Password must be at least 8 characters long";
  }
}

export function validateName(name: unknown): string | undefined {
  if (typeof name !== "string" || name.length === 0) {
    return "Name is required";
  }
}

export function validatePasswordMatch(password: unknown, confirmPassword: unknown): string | undefined {
  if (password !== confirmPassword) {
    return "Passwords do not match";
  }
}
