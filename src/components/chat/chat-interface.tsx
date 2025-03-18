"use client";

import { generateUUID } from "@/lib/utils";
import { useChat } from "@ai-sdk/react";
import ChatInput from "./chat-input";
import ChatMessages from "./chat-messages";

export default function ChatInterface() {
  const { messages, input, setInput, status, handleSubmit } = useChat({
    generateId: generateUUID,
    sendExtraMessageFields: true,
  });

  return (
    <div className="flex flex-col w-full max-w-md py-24 mx-auto stretch">
      <ChatMessages messages={messages} />
      <form className="fixed bottom-0 w-full max-w-md mb-8 border border-gray-300 rounded shadow-xl">
        <ChatInput
          status={status}
          input={input}
          setInput={setInput}
          handleSubmit={handleSubmit}
        />
      </form>
    </div>
  );
}
