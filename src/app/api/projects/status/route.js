import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import jwt from "jsonwebtoken";

export const dynamic = 'force-dynamic';
export const revalidate = 0;


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
      .select("id, team_id, linkedin_submission_count, linkedin_score")
      .eq("id", decoded.userId)
      .single();

    if (userError || !user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Find if user submitted mini projects
    const { data: miniDbs } = await supabase
      .from("projects")
      .select("*")
      .eq("type", "Mini")
      .eq("submitter_id", user.id)
      .order('created_at', { ascending: true });

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

    const miniProjects = (miniDbs || []).map(miniDb => ({
      _id: miniDb.id,
      githubLink: miniDb.github_link,
      imageUrl: miniDb.image_url,
      type: miniDb.type,
      status: miniDb.status || "Pending",
      adminComment: miniDb.admin_comment || ""
    }));

    const mainProject = mainDb ? {
      _id: mainDb.id,
      githubLink: mainDb.github_link,
      imageUrl: mainDb.image_url,
      liveLink: mainDb.live_link,
      type: mainDb.type,
      status: mainDb.status || "Pending",
      adminComment: mainDb.admin_comment || ""
    } : null;

    return NextResponse.json({ 
      miniProjects, 
      mainProject,
      linkedin: {
        score: user.linkedin_score || 0,
        submissionCount: user.linkedin_submission_count || 0
      }
    });
  } catch (error) {
    console.error("Project status error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
