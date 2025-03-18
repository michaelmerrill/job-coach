import { stackServerApp } from "@/lib/stack";
import { NextRequest } from "next/server";
import { openai } from "@ai-sdk/openai";
import { appendResponseMessages, streamText, UIMessage } from "ai";
import {
  generateUUID,
  getMostRecentUserMessage,
  getTrailingMessageId,
} from "@/lib/utils";
import { getChatById, saveChat, saveMessages } from "@/db/queries";
import { prompt } from "@/lib/ai/prompt";

export const maxDuration = 60;

export async function POST(request: NextRequest) {
  try {
    const user = await stackServerApp.getUser({ or: "return-null" });

    if (!user) {
      return new Response("Unauthorized", { status: 401 });
    }

    const { id, messages }: { id: string; messages: UIMessage[] } =
      await request.json();

    const userMessage = getMostRecentUserMessage(messages);

    if (!userMessage) {
      return new Response("No user message found", { status: 400 });
    }

    const chat = await getChatById({ id });

    if (!chat) {
      await saveChat({ id, userId: user.id });
    } else {
      if (chat.userId !== user.id) {
        return new Response("Unauthorized", { status: 401 });
      }
    }

    // save user message
    await saveMessages({
      messages: [
        {
          chatId: id,
          id: userMessage.id,
          role: "user",
          parts: userMessage.parts,
        },
      ],
    });

    const {
      firstName,
      lastName,
    }: {
      firstName: string;
      lastName: string;
    } = user.clientMetadata;

    const result = streamText({
      model: openai.responses("gpt-4o-mini"),
      messages,
      system: prompt({ firstName, lastName }),
      experimental_generateMessageId: generateUUID,
      async onFinish({ response }) {
        try {
          const assistantId = getTrailingMessageId({
            messages: response.messages.filter((m) => m.role === "assistant"),
          });

          if (!assistantId) {
            throw new Error("No assistant message found!");
          }

          const [, assistantMessage] = appendResponseMessages({
            messages: [userMessage],
            responseMessages: response.messages,
          });

          // save assistant message
          await saveMessages({
            messages: [
              {
                chatId: id,
                id: assistantId,
                role: assistantMessage.role,
                parts: assistantMessage.parts,
              },
            ],
          });
        } catch (error) {
          console.error("Failed to save assistant message", error);
        }
      },
    });

    result.consumeStream();

    return result.toDataStreamResponse();
  } catch (error) {
    console.error(error);
    return new Response("Internal server error", { status: 500 });
  }
}
