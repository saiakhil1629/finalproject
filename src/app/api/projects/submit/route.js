import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import jwt from "jsonwebtoken";

export async function POST(req) {
  try {
    const token = req.cookies.get("token")?.value;
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Get user details
    const { data: user, error: userError } = await supabase
      .from("users")
      .select("*")
      .eq("id", decoded.userId)
      .single();

    if (userError || !user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const { type, githubLink, imageUrl } = await req.json();

    if (!type || !githubLink || !imageUrl) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    if (type === "Main") {
      if (user.role !== "Lead" || !user.team_id) {
        return NextResponse.json({ error: "Only team leads can submit the main project" }, { status: 403 });
      }
    }

    // Check if project already submitted
    let existingProject = null;
    if (type === "Main") {
      const { data } = await supabase
        .from("projects")
        .select("id")
        .eq("type", "Main")
        .eq("team_id", user.team_id)
        .maybeSingle();
      existingProject = data;
    } else {
      const { data } = await supabase
        .from("projects")
        .select("id")
        .eq("type", "Mini")
        .eq("submitter_id", user.id)
        .maybeSingle();
      existingProject = data;
    }

    if (existingProject) {
      return NextResponse.json({ error: `${type} Project has already been submitted.` }, { status: 400 });
    }

    // Insert new project submission
    const { data: project, error: insertError } = await supabase
      .from("projects")
      .insert({
        type,
        submitter_id: user.id,
        team_id: type === "Main" ? user.team_id : null,
        github_link: githubLink,
        image_url: imageUrl,
      })
      .select()
      .single();

    if (insertError) throw insertError;

    return NextResponse.json({ message: `${type} Project submitted successfully!`, project }, { status: 201 });
  } catch (error) {
    console.error("Project Submit Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
