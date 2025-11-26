import { Form, useActionData, useNavigation, Link } from "react-router";
import { ID, Client, Account } from "node-appwrite";
import { createUserSession } from "~/services/session.server";
import { createAdminClient } from "~/services/appwrite.server";
import { validateEmail, validateName, validatePassword, validatePasswordMatch } from "~/utils/validation";
import type { Route } from "./+types/signup";
import { toast } from "sonner";
import { useEffect } from "react";
import { ThemeToggle } from "~/components/ThemeToggle";

export function meta({}: Route.MetaArgs) {
  return [{ title: "Sign Up - Recursive To-Do" }];
}

export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData();
  const email = formData.get("email");
  const password = formData.get("password");
  const confirmPassword = formData.get("confirmPassword");
  const name = formData.get("name");

  const errors = {
    email: validateEmail(email),
    password: validatePassword(password),
    confirmPassword: validatePasswordMatch(password, confirmPassword),
    name: validateName(name),
    form: undefined as string | undefined
  };

  if (errors.email || errors.password || errors.confirmPassword || errors.name) {
    return { errors };
  }

  try {
    // Use Admin Client to bypass Rate Limits
    const { users } = createAdminClient();
    
    // 1. Create User via Admin API (Users service)
    const userId = ID.unique();
    await users.create({
      userId,
      email: email as string,
      password: password as string,
      name: name as string
    });

    // 2. Create Session
    // We use users.createSession from Admin API to generate a session for the new user
    const session = await users.createSession(userId);

    // 3. Trigger Verification Email (Client Side Logic on Server)
    try {
      const client = new Client()
        .setEndpoint(process.env.VITE_APPWRITE_ENDPOINT!)
        .setProject(process.env.VITE_APPWRITE_PROJECT_ID!)
        .setSession(session.secret);

      const account = new Account(client);
      const origin = new URL(request.url).origin;
      
      // Sends email to the user
      await account.createVerification(`${origin}/dashboard`);
    } catch (emailError) {
      console.error("[Signup] Failed to send verification email:", emailError);
      // We continue anyway, as the user is created and logged in
    }

    // 4. Store Session
    return createUserSession(session.secret, "/dashboard");

  } catch (error: any) {
    console.error("[Signup] Error:", error);
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
      <div style={{ position: 'absolute', top: '1rem', right: '1rem' }}>
        <ThemeToggle />
      </div>
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
