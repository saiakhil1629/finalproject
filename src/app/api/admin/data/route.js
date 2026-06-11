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

export async function GET(req) {
  try {
    const isAdmin = await verifyAdmin(req);
    if (!isAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Fetch all users (excluding Admin)
    const { data: dbStudents, error: studentsError } = await supabase
      .from("users")
      .select("*, teamId:teams!team_id(*)")
      .neq("role", "Admin")
      .order("created_at", { ascending: false });

    if (studentsError) throw studentsError;

    // Fetch all teams and their leads
    const { data: dbTeams, error: teamsError } = await supabase
      .from("teams")
      .select("*, lead:users!lead_id(*)")
      .order("created_at", { ascending: false });

    if (teamsError) throw teamsError;

    // Fetch all project submissions
    const { data: dbProjects, error: projectsError } = await supabase
      .from("projects")
      .select("*, submitter:users(*), team:teams(*)")
      .order("created_at", { ascending: false });

    if (projectsError) throw projectsError;

    // Map database structures to camelCase format expected by the frontend
    const students = dbStudents.map(student => ({
      _id: student.id,
      name: student.name,
      sucNumber: student.suc_number,
      campus: student.campus,
      section: student.section,
      class: student.class,
      rollNumber: student.roll_number,
      rating: student.rating,
      role: student.role,
      teamId: student.teamId ? { _id: student.teamId.id, name: student.teamId.name } : null
    }));

    // For each team, we need to fetch its member list
    const { data: dbAllMembers } = await supabase
      .from("users")
      .select("id, name, suc_number, campus, team_id");

    const teams = dbTeams.map(team => {
      const teamMembers = (dbAllMembers || [])
        .filter(m => m.team_id === team.id)
        .map(m => ({
          _id: m.id,
          name: m.name,
          sucNumber: m.suc_number,
          campus: m.campus
        }));

      return {
        _id: team.id,
        name: team.name,
        joinCode: team.join_code,
        maxSize: team.max_size,
        leadId: team.lead ? { _id: team.lead.id, name: team.lead.name, campus: team.lead.campus } : null,
        members: teamMembers
      };
    });

    const projects = dbProjects.map(proj => ({
      _id: proj.id,
      type: proj.type,
      githubLink: proj.github_link,
      imageUrl: proj.image_url,
      submitterId: proj.submitter ? { name: proj.submitter.name, campus: proj.submitter.campus, sucNumber: proj.submitter.suc_number } : null,
      teamId: proj.team ? { name: proj.team.name, joinCode: proj.team.join_code } : null,
      status: proj.status || "Pending",
      adminComment: proj.admin_comment || ""
    }));

    return NextResponse.json({ students, teams, projects });
  } catch (error) {
    console.error("Admin data fetch error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
