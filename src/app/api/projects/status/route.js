import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Project from "@/models/Project";
import jwt from "jsonwebtoken";

export async function GET(req) {
  try {
    const token = req.cookies.get("token")?.value;
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    await dbConnect();

    // Find if user submitted mini project
    const miniProject = await Project.findOne({ type: "Mini", submitterId: decoded.userId });

    // Find if user's team submitted main project (if they belong to a team)
    // We can query user details first to find team ID
    const userResponse = await fetch(`${req.nextUrl.origin}/api/auth/me`, {
      headers: { cookie: `token=${token}` }
    });
    
    if (!userResponse.ok) {
      return NextResponse.json({ error: "Failed to get user context" }, { status: 401 });
    }
    
    const { user } = await userResponse.json();

    let mainProject = null;
    if (user.teamId) {
      mainProject = await Project.findOne({ type: "Main", teamId: user.teamId._id });
    }

    return NextResponse.json({ miniProject, mainProject });
  } catch (error) {
    console.error("Project status error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
