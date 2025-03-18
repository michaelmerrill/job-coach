"use client";

import { UIMessage } from "ai";

export default function ChatMessages({ messages }: { messages: UIMessage[] }) {
  return (
    <div className="flex flex-col w-full max-w-md py-24 mx-auto stretch">
      {messages.map((m) => (
        <div key={m.id} className="whitespace-pre-wrap">
          {m.role === "user" ? "User: " : "Sylvia: "}
          {m.content}
        </div>
      ))}
    </div>
  );
}
