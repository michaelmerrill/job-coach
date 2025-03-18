"use client";

import { Textarea } from "@/components/ui/textarea";
import type { UseChatHelpers } from "@ai-sdk/react";

export default function ChatInput({
  status,
  input,
  setInput,
  handleSubmit,
}: {
  status: UseChatHelpers["status"];
  input: UseChatHelpers["input"];
  setInput: UseChatHelpers["setInput"];
  handleSubmit: UseChatHelpers["handleSubmit"];
}) {
  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();

      if (!input || status === "submitted" || status === "streaming") {
        return;
      }

      handleSubmit(e);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
  };

  return (
    <Textarea
      className="w-full p-2"
      placeholder="Say something..."
      value={input}
      onChange={handleInputChange}
      autoFocus
      onKeyDown={onKeyDown}
    />
  );
}
