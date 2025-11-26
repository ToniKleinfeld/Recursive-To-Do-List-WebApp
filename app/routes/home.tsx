import { redirect } from "react-router";
import type { Route } from "./+types/home";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Recursive To-Do" },
    { name: "description", content: "Redirecting to dashboard..." },
  ];
}

export function loader() {
  return redirect("/dashboard");
}

export default function Home() {
  return null;
}

