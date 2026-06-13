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

    // Get user details to retrieve team_id
    const { data: user, error: userError } = await supabase
      .from("users")
      .select("team_id")
      .eq("id", decoded.userId)
      .single();

    if (userError || !user.team_id) {
      return NextResponse.json({ error: "No team associated" }, { status: 404 });
    }

    // Get team details
    const { data: team, error: teamError } = await supabase
      .from("teams")
      .select("*, problem_statements(id, title, description)")
      .eq("id", user.team_id)
      .single();

    if (teamError || !team) {
      return NextResponse.json({ error: "Team not found" }, { status: 404 });
    }

    // Get team members details
    const { data: members, error: membersError } = await supabase
      .from("users")
      .select("id, name, suc_number, campus, section, class, roll_number, role")
      .eq("team_id", user.team_id);

    if (membersError) throw membersError;

    // Map properties to match frontend structure
    const formattedMembers = members.map(m => ({
      _id: m.id,
      name: m.name,
      sucNumber: m.suc_number,
      campus: m.campus,
      section: m.section,
      class: m.class,
      rollNumber: m.roll_number,
      role: m.role
    }));

    const leadUser = formattedMembers.find(m => m.role === "Lead") || formattedMembers[0];

    const formattedTeam = {
      _id: team.id,
      name: team.name,
      joinCode: team.join_code,
      maxSize: team.max_size,
      problemStatement: team.problem_statements ? {
        _id: team.problem_statements.id,
        title: team.problem_statements.title,
        description: team.problem_statements.description
      } : null,
      createdAt: team.created_at,
      leadId: { _id: leadUser?._id },
      members: formattedMembers
    };

    return NextResponse.json({ team: formattedTeam });
  } catch (error) {
    console.error("Fetch Team Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
