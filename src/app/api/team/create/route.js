import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import jwt from "jsonwebtoken";

function generateJoinCode() {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

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

    const { teamName, maxSize } = await req.json();

    if (!teamName || !maxSize) {
      return NextResponse.json({ error: "Missing team name or size" }, { status: 400 });
    }

    const parsedSize = parseInt(maxSize);
    if (parsedSize < 3 || parsedSize > 5) {
      return NextResponse.json({ error: "Team size must be between 3 and 5 members" }, { status: 400 });
    }

    // Generate unique code and verify it does not exist
    let joinCode = generateJoinCode();
    let { data: existingTeam } = await supabase
      .from("teams")
      .select("id")
      .eq("join_code", joinCode)
      .maybeSingle();

    while (existingTeam) {
      joinCode = generateJoinCode();
      const res = await supabase
        .from("teams")
        .select("id")
        .eq("join_code", joinCode)
        .maybeSingle();
      existingTeam = res.data;
    }

    // Create the team
    const { data: team, error: teamError } = await supabase
      .from("teams")
      .insert({
        name: teamName,
        lead_id: decoded.userId,
        join_code: joinCode,
        max_size: parsedSize,
      })
      .select()
      .single();

    if (teamError) throw teamError;

    // Update user details
    const { error: updateError } = await supabase
      .from("users")
      .update({
        role: "Lead",
        team_id: team.id,
      })
      .eq("id", decoded.userId);

    if (updateError) throw updateError;

    // Map properties to match frontend
    team.joinCode = team.join_code;

    return NextResponse.json({ message: "Team created successfully!", team }, { status: 201 });
  } catch (error) {
    console.error("Create Team Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
