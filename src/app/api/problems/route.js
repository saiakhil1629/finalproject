import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import jwt from "jsonwebtoken";

// Verify admin helper
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
    const token = req.cookies.get("token")?.value;
    let userCampus = null;

    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const { data: user } = await supabase
          .from("users")
          .select("campus")
          .eq("id", decoded.userId)
          .single();
        if (user) userCampus = user.campus;
      } catch (e) {
        // Ignored
      }
    }

    const { data: problems, error } = await supabase
      .from("problem_statements")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;

    let takenProblemIds = new Set();

    if (userCampus) {
      // Find all teams that have selected a problem statement in the same campus
      const { data: campusUsers } = await supabase
        .from("users")
        .select("team_id")
        .eq("campus", userCampus)
        .not("team_id", "is", null);

      if (campusUsers && campusUsers.length > 0) {
        const teamIdsInCampus = [...new Set(campusUsers.map(u => u.team_id))];
        
        const { data: teamsWithProblems } = await supabase
          .from("teams")
          .select("problem_statement_id")
          .in("id", teamIdsInCampus)
          .not("problem_statement_id", "is", null);

        if (teamsWithProblems) {
          teamsWithProblems.forEach(t => takenProblemIds.add(t.problem_statement_id));
        }
      }
    }

    // Map database keys to frontend (_id)
    const formattedProblems = problems.map(p => ({
      _id: p.id,
      title: p.title,
      description: p.description,
      createdAt: p.created_at,
      isTakenInCampus: takenProblemIds.has(p.id)
    }));

    return NextResponse.json({ problems: formattedProblems });
  } catch (error) {
    console.error("Fetch problems error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const isAdmin = await verifyAdmin(req);
    if (!isAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { title, description } = await req.json();
    if (!title || !description) {
      return NextResponse.json({ error: "Missing title or description" }, { status: 400 });
    }

    const { data: problem, error } = await supabase
      .from("problem_statements")
      .insert({ title, description })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ message: "Problem statement created", problem }, { status: 201 });
  } catch (error) {
    console.error("Create problem error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(req) {
  try {
    const isAdmin = await verifyAdmin(req);
    if (!isAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await req.json();
    if (!id) {
      return NextResponse.json({ error: "Missing ID" }, { status: 400 });
    }

    const { error } = await supabase
      .from("problem_statements")
      .delete()
      .eq("id", id);

    if (error) throw error;

    return NextResponse.json({ message: "Problem statement deleted" });
  } catch (error) {
    console.error("Delete problem error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
