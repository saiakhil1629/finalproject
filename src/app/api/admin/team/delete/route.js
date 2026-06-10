import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Team from "@/models/Team";
import User from "@/models/User";
import Project from "@/models/Project";
import jwt from "jsonwebtoken";

async function verifyAdmin(req) {
  const token = req.cookies.get("token")?.value;
  if (!token) return false;
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    await dbConnect();
    const user = await User.findById(decoded.userId);
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

    await dbConnect();

    // Find the team
    const team = await Team.findById(teamId);
    if (!team) {
      return NextResponse.json({ error: "Team not found" }, { status: 404 });
    }

    // Reset roles and team IDs of all members in the team
    await User.updateMany(
      { teamId: teamId },
      { $set: { role: "None", teamId: null } }
    );

    // Delete any main project submissions associated with this team
    await Project.deleteMany({ teamId: teamId });

    // Delete the team itself
    await Team.findByIdAndDelete(teamId);

    return NextResponse.json({ message: "Team deleted and members reset successfully!" });
  } catch (error) {
    console.error("Admin team delete error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
