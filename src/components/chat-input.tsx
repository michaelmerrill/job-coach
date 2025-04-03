"use client";

import { Textarea } from "@/components/ui/textarea";
import { RefObject, useState } from "react";
import { Button } from "./ui/button";
import { Send } from "lucide-react";

interface ChatInputProps {
  activeElementRef?: RefObject<HTMLTextAreaElement | null>;
  canSend: boolean;
  onSendMessage: (message: string) => void;
}

export default function ChatInput({
  activeElementRef,
  canSend,
  onSendMessage,
}: ChatInputProps) {
  const [input, setInput] = useState("");

  const submit = () => {
    if (!input.trim()) return;
    onSendMessage(input.trim());
    setInput("");
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      if (!input || !canSend) {
        return;
      }
      e.preventDefault();
      submit();
    }
  };

  const onChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
  };

  return (
    <div className="grid grid-cols-[1fr_auto] gap-2 items-center">
      <Textarea
        ref={activeElementRef}
        className="w-full"
        placeholder="Type your message..."
        autoFocus
        rows={2}
        value={input}
        onChange={onChange}
        onKeyDown={onKeyDown}
      />
      <Button onClick={submit} className="bg-green-500">
        <Send size={18} />
      </Button>
    </div>
  );
}
