import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Team from "@/models/Team";
import User from "@/models/User";
import jwt from "jsonwebtoken";

// Function to generate a simple unique join code
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
    await dbConnect();

    const user = await User.findById(decoded.userId);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (user.teamId) {
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
    let codeExists = await Team.findOne({ joinCode });
    while (codeExists) {
      joinCode = generateJoinCode();
      codeExists = await Team.findOne({ joinCode });
    }

    const team = await Team.create({
      name: teamName,
      leadId: user._id,
      joinCode,
      members: [user._id],
      maxSize: parsedSize,
    });

    user.role = "Lead";
    user.teamId = team._id;
    await user.save();

    return NextResponse.json({ message: "Team created successfully!", team }, { status: 201 });
  } catch (error) {
    console.error("Create Team Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
