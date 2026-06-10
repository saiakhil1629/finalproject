import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Team from "@/models/Team";
import User from "@/models/User";
import jwt from "jsonwebtoken";

export async function POST(req) {
  try {
    const token = req.cookies.get("token")?.value;
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    await dbConnect();

    const user = await User.findById(decoded.userId);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (user.teamId) {
      return NextResponse.json({ error: "You are already in a team." }, { status: 400 });
    }

    const { joinCode } = await req.json();

    if (!joinCode) {
      return NextResponse.json({ error: "Join code is required" }, { status: 400 });
    }

    const team = await Team.findOne({ joinCode: joinCode.trim().toUpperCase() });
    if (!team) {
      return NextResponse.json({ error: "Invalid Join Code. Team not found." }, { status: 404 });
    }

    if (team.members.length >= team.maxSize) {
      return NextResponse.json({ error: "Team is already full." }, { status: 400 });
    }

    // Add user to team
    team.members.push(user._id);
    await team.save();

    // Update user details
    user.role = "Member";
    user.teamId = team._id;
    await user.save();

    return NextResponse.json({ message: "Joined team successfully!", team }, { status: 200 });
  } catch (error) {
    console.error("Join Team Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
