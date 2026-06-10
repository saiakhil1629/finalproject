import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Project from "@/models/Project";
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

    const { type, githubLink, imageUrl } = await req.json();

    if (!type || !githubLink || !imageUrl) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    if (type === "Main") {
      if (user.role !== "Lead" || !user.teamId) {
        return NextResponse.json({ error: "Only team leads can submit the main project" }, { status: 403 });
      }
    }

    // Check if project already submitted
    let existingProject;
    if (type === "Main") {
      existingProject = await Project.findOne({ type: "Main", teamId: user.teamId });
    } else {
      existingProject = await Project.findOne({ type: "Mini", submitterId: user._id });
    }

    if (existingProject) {
      return NextResponse.json({ error: `${type} Project has already been submitted.` }, { status: 400 });
    }

    const newProject = await Project.create({
      type,
      submitterId: user._id,
      teamId: type === "Main" ? user.teamId : null,
      githubLink,
      imageUrl,
    });

    return NextResponse.json({ message: `${type} Project submitted successfully!`, project: newProject }, { status: 201 });
  } catch (error) {
    console.error("Project Submit Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
