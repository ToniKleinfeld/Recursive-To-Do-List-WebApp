import { Form, useActionData, useNavigation, Link } from "react-router";
import { ID, Client, Account } from "node-appwrite";
import { createUserSession } from "~/services/session.server";
import { validateEmail, validateName, validatePassword, validatePasswordMatch } from "~/utils/validation";
import type { Route } from "./+types/signup";
import { toast } from "sonner";
import { useEffect } from "react";

export function meta({}: Route.MetaArgs) {
  return [{ title: "Sign Up - Recursive To-Do" }];
}

export async function action({ request }: Route.ActionArgs) {
  console.log("Signup action started"); // Debug log
  const formData = await request.formData();
  const email = formData.get("email");
  const password = formData.get("password");
  const confirmPassword = formData.get("confirmPassword");
  const name = formData.get("name");

  console.log("Signup attempt for:", email); // Debug log

  const errors = {
    email: validateEmail(email),
    password: validatePassword(password),
    confirmPassword: validatePasswordMatch(password, confirmPassword),
    name: validateName(name),
    form: undefined as string | undefined
  };

  if (errors.email || errors.password || errors.confirmPassword || errors.name) {
    console.log("Validation errors:", errors); // Debug log
    return { errors };
  }

  try {
    console.log("Initializing Appwrite client..."); // Debug log
    console.log("Endpoint:", process.env.VITE_APPWRITE_ENDPOINT); // Debug log
    // Use a public client (no API Key) for self-registration
    // This avoids permission issues with the Admin API Key
    const client = new Client()
        .setEndpoint(process.env.VITE_APPWRITE_ENDPOINT!)
        .setProject(process.env.VITE_APPWRITE_PROJECT_ID!);
    
    const account = new Account(client);
    
    // 1. Create User (Public registration)
    console.log("Creating account..."); // Debug log
    await account.create(ID.unique(), email as string, password as string, name as string);
    console.log("Account created successfully"); // Debug log

    // 2. Create Session (Login)
    console.log("Creating session..."); // Debug log
    const session = await account.createEmailPasswordSession(email as string, password as string);
    console.log("Session created"); // Debug log

    // 3. Store Session
    console.log("Storing session and redirecting..."); // Debug log
    return createUserSession(session.secret, "/dashboard");

  } catch (error: any) {
    console.error("Signup Error Full Object:", error); // Debug log
    return { errors: { ...errors, form: error.message || "Something went wrong during signup." } };
  }
}


export default function Signup() {
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
        <h1 className="auth-title">Create Account</h1>
        <p className="auth-subtitle">Join us to organize your tasks recursively.</p>

        <Form method="post" className="auth-form">
          <div className="form-group">
            <label htmlFor="name">Full Name</label>
            <input
              type="text"
              id="name"
              name="name"
              placeholder="John Doe"
              className={actionData?.errors?.name ? "error" : ""}
            />
            {actionData?.errors?.name && <span className="error-message">{actionData.errors.name}</span>}
          </div>

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

          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              placeholder="••••••••"
              className={actionData?.errors?.confirmPassword ? "error" : ""}
            />
            {actionData?.errors?.confirmPassword && <span className="error-message">{actionData.errors.confirmPassword}</span>}
          </div>

          <button type="submit" disabled={isSubmitting} className="btn-primary">
            {isSubmitting ? "Creating Account..." : "Sign Up"}
          </button>
        </Form>

        <div className="auth-footer">
          <p>Already have an account? <Link to="/login">Log in</Link></p>
        </div>
      </div>
    </div>
  );
}
