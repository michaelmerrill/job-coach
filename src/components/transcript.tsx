"use client";

import { TranscriptItem } from "@/lib/types";
import { cn } from "@/lib/utils";
import { useEffect, useRef } from "react";

export default function Transcript({
  transcriptItems,
}: {
  transcriptItems: TranscriptItem[];
}) {
  const transcriptEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    transcriptEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [transcriptItems]);

  return (
    <>
      {transcriptItems.map((item) => {
        if (item.isHidden) return null;

        return (
          <div
            key={item.itemId}
            className={cn(
              "whitespace-pre-wrap",
              item.role === "user"
                ? "justify-items-end"
                : "justify-items-start",
            )}
          >
            <div
              className={cn(
                "max-w-[80%] rounded-lg p-3",
                item.role === "user"
                  ? "bg-green-100 text-gray-800"
                  : "bg-gray-100 text-gray-800",
              )}
            >
              <p>{item.title}</p>
              <p className="text-xs text-gray-500 mt-1">{item.timestamp}</p>
            </div>
          </div>
        );
      })}
      <div ref={transcriptEndRef} />
    </>
  );
}
