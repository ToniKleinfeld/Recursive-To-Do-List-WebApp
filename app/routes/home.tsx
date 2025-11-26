import type { Route } from "./+types/home";
import { Welcome } from "../welcome/welcome";
import { client } from "~/lib/appwrite";
import { useEffect, useState } from "react";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "New React Router App" },
    { name: "description", content: "Welcome to React Router!" },
  ];
}

export default function Home() {
  const [status, setStatus] = useState("Connecting to Appwrite...");

  useEffect(() => {
    // Einfacher Test: Prüfen ob der Client konfiguriert ist
    if (client) {
      setStatus("✅ Appwrite Client initialized!");
      console.log("Appwrite Client:", client);
    }
  }, []);

  return (
    <div className="p-4 font-sans">
      <h1 className="text-2xl font-bold mb-4">System Check</h1>
      <div className="p-4 border rounded bg-gray-50">
        <p><strong>Appwrite Status:</strong> {status}</p>
      </div>
      <hr className="my-8" />
      <Welcome />
    </div>
  );
}
