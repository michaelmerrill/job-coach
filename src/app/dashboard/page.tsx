"use server";

import { stackServerApp } from "@/lib/stack";
import ChatInterface from "@/components/chat-interface";

export default async function Dashboard() {
  await stackServerApp.getUser({ or: "redirect" });

  return (
    <main className="grid min-h-screen place-items-center p-4 bg-gray-50">
      <div className="w-full max-w-3xl">
        <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">
          Sylvia
        </h1>
        <ChatInterface />
      </div>
    </main>
  );
}
