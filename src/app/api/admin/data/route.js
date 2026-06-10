import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import Team from "@/models/Team";
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

export async function GET(req) {
  try {
    const isAdmin = await verifyAdmin(req);
    if (!isAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await dbConnect();

    // Fetch all users (excluding passwords)
    const students = await User.find({ role: { $ne: "Admin" } })
      .select("-password")
      .populate("teamId")
      .sort({ createdAt: -1 });

    // Fetch all teams and populate lead & members
    const teams = await Team.find()
      .populate("leadId", "name sucNumber campus")
      .populate("members", "name sucNumber campus section class rollNumber")
      .sort({ createdAt: -1 });

    // Fetch all project submissions
    const projects = await Project.find()
      .populate("submitterId", "name sucNumber campus class section")
      .populate("teamId", "name joinCode")
      .sort({ createdAt: -1 });

    return NextResponse.json({ students, teams, projects });
  } catch (error) {
    console.error("Admin data fetch error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
