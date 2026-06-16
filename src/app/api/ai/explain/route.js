import { NextResponse } from "next/server";
import Groq from "groq-sdk";

export async function POST(req) {
  try {
    const { title, description } = await req.json();

    if (!title || !description) {
      return NextResponse.json({ error: "Title and description are required" }, { status: 400 });
    }

    if (!process.env.GROQ_API_KEY) {
      return NextResponse.json({ error: "Groq API key is not configured on the server" }, { status: 500 });
    }

    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

    const prompt = `Act as a Senior Software Engineer mentoring an intern. 
You are given the following internship problem statement.
Title: ${title}
Description: ${description}

Please provide a highly structured, simple, step-by-step technical breakdown of what the intern needs to build. 
Format your response in Markdown. Include:
1. **Core Objectives**: 1-2 sentences summarizing the goal.
2. **Tech Stack & Concepts to Learn**: A bulleted list of technologies they should use or research.
3. **Step-by-Step MVP Implementation**: A numbered checklist of what to build first, second, third to get a working Minimum Viable Product.

Keep it encouraging, concise, and highly actionable. Avoid overly dense text; use formatting (bolding, lists) to make it scannable.`;

    const chatCompletion = await groq.chat.completions.create({
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
      model: "llama-3.1-8b-instant",
    });

    return NextResponse.json({ explanation: chatCompletion.choices[0]?.message?.content || "" });
  } catch (error) {
    console.error("Groq API Error:", error);
    return NextResponse.json(
      { error: "Failed to generate explanation. Details: " + (error.message || error.toString()) },
      { status: 500 }
    );
  }
}
