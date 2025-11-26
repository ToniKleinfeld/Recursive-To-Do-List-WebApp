import { Link, useNavigate } from "react-router";
import { account } from "~/services/appwrite";
import { validateEmail, validatePassword } from "~/utils/validation";
import type { Route } from "./+types/login";
import { toast } from "sonner";
import { useState } from "react";
import { createUserSession } from "~/services/session.server";
import { ThemeToggle } from "~/components/ThemeToggle";

export function meta({}: Route.MetaArgs) {
  return [{ title: "Login - Recursive To-Do" }];
}

// We need an action to set the cookie on the server after client-side login
export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData();
  const secret = formData.get("secret") as string;
  
  if (!secret) {
    return { error: "No secret provided" };
  }

  return createUserSession(secret, "/dashboard");
}

// ...existing code...
export default function Login() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string; form?: string }>({});

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrors({});

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    const newErrors = {
      email: validateEmail(email),
      password: validatePassword(password),
    };

    if (newErrors.email || newErrors.password) {
      setErrors(newErrors);
      setIsSubmitting(false);
      return;
    }

    try {
      // Ensure no active session exists before creating a new one
      try {
        await account.deleteSession("current");
      } catch (e) {
        // Ignore if no session exists
      }

      // 1. Client: Login
      await account.createEmailPasswordSession(email, password);
      
      // 2. Client: Create JWT
      const jwt = await account.createJWT();
      
      // 3. Client: Send JWT to Remix Server via Action
      const form = new FormData();
      form.append("secret", jwt.jwt); // We use the JWT as the "token" for our session
      
      const response = await fetch("/login", {
        method: "POST",
        body: form
      });
      
      if (response.ok) {
        toast.success("Logged in successfully");
        navigate("/dashboard");
      } else {
        throw new Error("Failed to sync session");
      }

    } catch (error: any) {
      console.error("Login Error:", error);
      setErrors({ form: "Invalid email or password." });
      toast.error("Invalid email or password.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-container">
      <div style={{ position: 'absolute', top: '1rem', right: '1rem' }}>
        <ThemeToggle />
      </div>
      <div className="auth-card">
        <h1 className="auth-title">Welcome Back</h1>
        <p className="auth-subtitle">Log in to continue organizing.</p>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              type="email"
              id="email"
              name="email"
              placeholder="you@example.com"
              className={errors.email ? "error" : ""}
            />
            {errors.email && <span className="error-message">{errors.email}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              placeholder="••••••••"
              className={errors.password ? "error" : ""}
            />
            {errors.password && <span className="error-message">{errors.password}</span>}
          </div>

          <button type="submit" disabled={isSubmitting} className="btn-primary">
            {isSubmitting ? "Logging in..." : "Log In"}
          </button>
        </form>

        <div className="auth-footer">
          <p>Don't have an account? <Link to="/signup">Sign up</Link></p>
        </div>
      </div>
    </div>
  );
}
