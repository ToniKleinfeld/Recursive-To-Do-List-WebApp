import { Link, useNavigate } from "react-router";
import { account } from "~/services/appwrite";
import { validateEmail, validatePassword } from "~/utils/validation";
import type { Route } from "./+types/login";
import { toast } from "sonner";
import { useState } from "react";

export function meta({}: Route.MetaArgs) {
  return [{ title: "Login - Recursive To-Do" }];
}

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
      await account.createEmailPasswordSession(email, password);
      toast.success("Logged in successfully");
      navigate("/dashboard");
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
