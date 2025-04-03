import { NextResponse } from "next/server";
import * as AIConfig from "@/lib/config";

export async function GET() {
  try {
    const response = await fetch(
      "https://api.openai.com/v1/realtime/sessions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "gpt-4o-realtime-preview",
          modalities: ["text", "audio"],
          instructions: AIConfig.INSTRUCTIONS,
          voice: AIConfig.VOICE,
          // tools: AIConfig.TOOLS,
        }),
      },
    );

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error creating realtime session in /api/session: ", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
