import { stackServerApp } from "@/lib/stack";
import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export const maxDuration = 60;

export async function POST(request: NextRequest) {
  try {
    const user = await stackServerApp.getUser({ or: "return-null" });

    if (!user) {
      return new Response("Unauthorized", { status: 401 });
    }

    const { previousResponseId, messages } = await request.json();

    const response = await openai.responses.create({
      model: "gpt-4o-mini",
      input: messages,
      previous_response_id: previousResponseId,
    });

    return NextResponse.json(response);
  } catch (error: Error | unknown) {
    console.error("Error in /chat/completions:", error);
    const errorMessage =
      error instanceof Error ? error.message : "An unexpected error occurred";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
