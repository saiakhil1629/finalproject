import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import jwt from "jsonwebtoken";

export async function GET(req) {
  try {
    const token = req.cookies.get("token")?.value;
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Get user details
    const { data: user, error: userError } = await supabase
      .from("users")
      .select("id, team_id")
      .eq("id", decoded.userId)
      .single();

    if (userError || !user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Find if user submitted mini project
    const { data: miniDb } = await supabase
      .from("projects")
      .select("*")
      .eq("type", "Mini")
      .eq("submitter_id", user.id)
      .maybeSingle();

    // Find if user's team submitted main project (if they belong to a team)
    let mainDb = null;
    if (user.team_id) {
      const { data } = await supabase
        .from("projects")
        .select("*")
        .eq("type", "Main")
        .eq("team_id", user.team_id)
        .maybeSingle();
      mainDb = data;
    }

    // Map database properties to frontend camelCase
    const miniProject = miniDb ? {
      _id: miniDb.id,
      githubLink: miniDb.github_link,
      imageUrl: miniDb.image_url,
      type: miniDb.type
    } : null;

    const mainProject = mainDb ? {
      _id: mainDb.id,
      githubLink: mainDb.github_link,
      imageUrl: mainDb.image_url,
      type: mainDb.type
    } : null;

    return NextResponse.json({ miniProject, mainProject });
  } catch (error) {
    console.error("Project status error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
