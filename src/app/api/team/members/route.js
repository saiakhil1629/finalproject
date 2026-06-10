import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Team from "@/models/Team";
import User from "@/models/User";
import jwt from "jsonwebtoken";

export async function GET(req) {
  try {
    const token = req.cookies.get("token")?.value;
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    await dbConnect();

    const user = await User.findById(decoded.userId);
    if (!user || !user.teamId) {
      return NextResponse.json({ error: "No team associated" }, { status: 404 });
    }

    const team = await Team.findById(user.teamId)
      .populate("leadId", "name sucNumber campus section class rollNumber")
      .populate("members", "name sucNumber campus section class rollNumber role");

    if (!team) {
      return NextResponse.json({ error: "Team not found" }, { status: 404 });
    }

    return NextResponse.json({ team });
  } catch (error) {
    console.error("Fetch Team Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
