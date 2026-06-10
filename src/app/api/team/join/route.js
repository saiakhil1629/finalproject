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

    // Fetch user details
    const { data: user, error: userError } = await supabase
      .from("users")
      .select("team_id")
      .eq("id", decoded.userId)
      .single();

    if (userError) throw userError;
    if (user.team_id) {
      return NextResponse.json({ error: "You are already in a team." }, { status: 400 });
    }

    const { joinCode } = await req.json();

    if (!joinCode) {
      return NextResponse.json({ error: "Join code is required" }, { status: 400 });
    }

    // Find the team
    const { data: team, error: teamError } = await supabase
      .from("teams")
      .select("*")
      .eq("join_code", joinCode.trim().toUpperCase())
      .maybeSingle();

    if (teamError) throw teamError;
    if (!team) {
      return NextResponse.json({ error: "Invalid Join Code. Team not found." }, { status: 404 });
    }

    // Count current team members
    const { count, error: countError } = await supabase
      .from("users")
      .select("*", { count: "exact", head: true })
      .eq("team_id", team.id);

    if (countError) throw countError;

    if (count >= team.max_size) {
      return NextResponse.json({ error: "Team is already full." }, { status: 400 });
    }

    // Join team: Update user
    const { error: updateError } = await supabase
      .from("users")
      .update({
        role: "Member",
        team_id: team.id,
      })
      .eq("id", decoded.userId);

    if (updateError) throw updateError;

    // Map properties to match frontend
    team.joinCode = team.join_code;

    return NextResponse.json({ message: "Joined team successfully!", team }, { status: 200 });
  } catch (error) {
    console.error("Join Team Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
