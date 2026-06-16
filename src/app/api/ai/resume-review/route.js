import { NextResponse } from "next/server";
import Groq from "groq-sdk";

export async function POST(req) {
  try {
    const { resumeData, targetRole } = await req.json();

    if (!resumeData) {
      return NextResponse.json({ error: "Resume data is required" }, { status: 400 });
    }

    const role = targetRole || "General Software Engineer";

    if (!process.env.GROQ_API_KEY) {
      return NextResponse.json({ error: "Groq API key is not configured on the server" }, { status: 500 });
    }

    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

    // Format the resume content for the prompt
    const personal = resumeData.personal || {};
    const educationStr = (resumeData.education || [])
      .map(e => `- ${e.degree} from ${e.institution} (${e.year}) ${e.gpa ? `GPA: ${e.gpa}` : ""}`)
      .join("\n");
    const experienceStr = (resumeData.experience || [])
      .map(e => `- ${e.role} at ${e.company} (${e.duration}):\n  ${e.details}`)
      .join("\n\n");
    const projectsStr = (resumeData.projects || [])
      .map(p => `- ${p.title} [Stack: ${p.tools}]:\n  ${p.details}`)
      .join("\n\n");

    const prompt = `Act as an expert ATS (Applicant Tracking System) optimizer and career coach.
Analyze the following student resume data and evaluate its match against the target job role: "${role}".

Resume Details:
- Name: ${personal.name || "N/A"}
- Professional Summary: ${resumeData.summary || "N/A"}
- Skills: ${resumeData.skills || "N/A"}

Education:
${educationStr || "N/A"}

Work Experience:
${experienceStr || "N/A"}

Projects:
${projectsStr || "N/A"}

Tasks to perform:
1. Assign an ATS Match Score between 0 and 100 based on standard recruiter criteria (skills match, action verbs, project quality, professional language).
2. Provide a brief compatibility summary (atsAnalysis) of 2-3 sentences.
3. List important technical/soft skills or keywords missing from this resume that are crucial for a "${role}" role.
4. List specific, actionable improvement suggestions. For example: suggest rewording descriptions to include metrics (e.g. "improved speed by 20%"), adding missing tools, or expanding on project contributions.

IMPORTANT: You must return ONLY a JSON object. Do not include markdown code block formatting (like \`\`\`json) or any conversational text before or after the JSON.

Return format:
{
  "score": 75,
  "atsAnalysis": "Your resume has a solid base in React and web dev, but lacks explicit backend engineering experience needed for a Full-Stack developer role.",
  "missingKeywords": ["Node.js", "Express", "RESTful APIs", "SQL", "Git workflow"],
  "improvementSuggestions": [
    "Under Work Experience, rephrase your responsibilities to start with stronger action verbs (e.g., 'Developed' instead of 'worked on').",
    "In your Next.js project, mention how you optimized performance or handled state management.",
    "Add database skills (SQL or NoSQL) if you have any exposure to them, as it is a common requirement."
  ]
}`;

    const chatCompletion = await groq.chat.completions.create({
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
      model: "llama-3.1-8b-instant",
      temperature: 0.3,
      response_format: { type: "json_object" }
    });

    const resultText = chatCompletion.choices[0]?.message?.content || "{}";
    const resultJson = JSON.parse(resultText);

    return NextResponse.json(resultJson);
  } catch (error) {
    console.error("Groq ATS Resume Reviewer API Error:", error);
    return NextResponse.json(
      { error: "Failed to generate resume review. Details: " + (error.message || error.toString()) },
      { status: 500 }
    );
  }
}
