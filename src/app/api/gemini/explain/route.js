import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

export async function POST(req) {
  try {
    const { title, description } = await req.json();

    if (!title || !description) {
      return NextResponse.json({ error: "Title and description are required" }, { status: 400 });
    }

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({ error: "Gemini API key is not configured on the server" }, { status: 500 });
    }

    // Initialize the official Google Gen AI SDK
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

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

    let response;
    try {
      response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
      });
    } catch (err) {
      console.warn("gemini-2.5-flash failed (likely high demand), falling back to gemini-1.5-flash:", err.message);
      response = await ai.models.generateContent({
        model: "gemini-1.5-flash",
        contents: prompt,
      });
    }

    return NextResponse.json({ explanation: response.text });
  } catch (error) {
    console.error("Gemini API Error:", error);
    return NextResponse.json(
      { error: "Failed to generate explanation. Details: " + (error.message || error.toString()) },
      { status: 500 }
    );
  }
}
