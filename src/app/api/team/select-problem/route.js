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
    const { problemId } = await req.json();

    if (!problemId) {
      return NextResponse.json({ error: "Missing problemId" }, { status: 400 });
    }

    // Get user details
    const { data: user, error: userError } = await supabase
      .from("users")
      .select("team_id, campus")
      .eq("id", decoded.userId)
      .single();

    if (userError || !user.team_id) {
      return NextResponse.json({ error: "No team associated" }, { status: 404 });
    }

    // Get team details
    const { data: team, error: teamError } = await supabase
      .from("teams")
      .select("*")
      .eq("id", user.team_id)
      .single();

    if (teamError || !team) {
      return NextResponse.json({ error: "Team not found" }, { status: 404 });
    }

    // Check if user is lead
    if (team.lead_id !== decoded.userId) {
      return NextResponse.json({ error: "Only team lead can select a problem statement" }, { status: 403 });
    }

    // Get team members count
    const { count: memberCount, error: memberCountError } = await supabase
      .from("users")
      .select("id", { count: "exact" })
      .eq("team_id", team.id);

    if (memberCountError) {
      return NextResponse.json({ error: "Failed to verify team size" }, { status: 500 });
    }

    if (memberCount !== team.max_size) {
      return NextResponse.json({ error: "Team must be fully formed to select a problem statement" }, { status: 400 });
    }

    // Check campus exclusivity
    const { data: campusUsers } = await supabase
      .from("users")
      .select("team_id")
      .eq("campus", user.campus)
      .not("team_id", "is", null)
      .neq("team_id", team.id); // Exclude current team

    if (campusUsers && campusUsers.length > 0) {
      const teamIdsInCampus = [...new Set(campusUsers.map(u => u.team_id))];
      
      const { data: conflictingTeams } = await supabase
        .from("teams")
        .select("id")
        .in("id", teamIdsInCampus)
        .eq("problem_statement_id", problemId);

      if (conflictingTeams && conflictingTeams.length > 0) {
        return NextResponse.json({ error: "This problem statement is already selected by another team in your campus" }, { status: 400 });
      }
    }

    // Update team with selected problem statement
    const { error: updateError } = await supabase
      .from("teams")
      .update({ problem_statement_id: problemId })
      .eq("id", team.id);

    if (updateError) throw updateError;

    return NextResponse.json({ message: "Problem statement selected successfully" }, { status: 200 });
  } catch (error) {
    console.error("Select Problem Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
