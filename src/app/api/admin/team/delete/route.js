import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import jwt from "jsonwebtoken";

async function verifyAdmin(req) {
  const token = req.cookies.get("token")?.value;
  if (!token) return false;
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const { data: user } = await supabase
      .from("users")
      .select("role")
      .eq("id", decoded.userId)
      .single();
    return user && user.role === "Admin";
  } catch {
    return false;
  }
}

export async function POST(req) {
  try {
    const isAdmin = await verifyAdmin(req);
    if (!isAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { teamId } = await req.json();
    if (!teamId) {
      return NextResponse.json({ error: "Team ID is required" }, { status: 400 });
    }

    // Reset roles and team IDs of all members in the team
    const { error: membersError } = await supabase
      .from("users")
      .update({ role: "None", team_id: null })
      .eq("team_id", teamId);

    if (membersError) throw membersError;

    // Delete any main project submissions associated with this team
    const { error: projectsError } = await supabase
      .from("projects")
      .delete()
      .eq("team_id", teamId);

    if (projectsError) throw projectsError;

    // Delete the team itself
    const { error: teamError } = await supabase
      .from("teams")
      .delete()
      .eq("id", teamId);

    if (teamError) throw teamError;

    return NextResponse.json({ message: "Team deleted and members reset successfully!" });
  } catch (error) {
    console.error("Admin team delete error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
