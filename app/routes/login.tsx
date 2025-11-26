import { Form, useActionData, useNavigation, Link } from "react-router";
import { Client, Account } from "node-appwrite";
import { createUserSession } from "~/services/session.server";
import { validateEmail, validatePassword } from "~/utils/validation";
import type { Route } from "./+types/login";
import { toast } from "sonner";
import { useEffect } from "react";

export function meta({}: Route.MetaArgs) {
  return [{ title: "Login - Recursive To-Do" }];
}

export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData();
  const email = formData.get("email");
  const password = formData.get("password");

  const errors = {
    email: validateEmail(email),
    password: validatePassword(password),
    form: undefined as string | undefined
  };

  if (errors.email || errors.password) {
    return { errors };
  }

  try {
    const client = new Client()
        .setEndpoint(process.env.VITE_APPWRITE_ENDPOINT!)
        .setProject(process.env.VITE_APPWRITE_PROJECT_ID!);
    
    const account = new Account(client);
    const session = await account.createEmailPasswordSession(email as string, password as string);

    return createUserSession(session.secret, "/dashboard");

  } catch (error: any) {
    console.error("Login Error:", error);
    return { errors: { ...errors, form: "Invalid email or password." } };
  }
}


export default function Login() {
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";

  useEffect(() => {
    if (actionData?.errors?.form) {
      toast.error(actionData.errors.form);
    }
  }, [actionData]);

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1 className="auth-title">Welcome Back</h1>
        <p className="auth-subtitle">Log in to continue organizing.</p>

        <Form method="post" className="auth-form">
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              type="email"
              id="email"
              name="email"
              placeholder="you@example.com"
              className={actionData?.errors?.email ? "error" : ""}
            />
            {actionData?.errors?.email && <span className="error-message">{actionData.errors.email}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              placeholder="••••••••"
              className={actionData?.errors?.password ? "error" : ""}
            />
            {actionData?.errors?.password && <span className="error-message">{actionData.errors.password}</span>}
          </div>

          <button type="submit" disabled={isSubmitting} className="btn-primary">
            {isSubmitting ? "Logging in..." : "Log In"}
          </button>
        </Form>

        <div className="auth-footer">
          <p>Don't have an account? <Link to="/signup">Sign up</Link></p>
        </div>
      </div>
    </div>
  );
}
