import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import ProblemStatement from "@/models/ProblemStatement";
import User from "@/models/User";
import jwt from "jsonwebtoken";

// Verify admin helper
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

export async function GET() {
  try {
    await dbConnect();
    const problems = await ProblemStatement.find().sort({ createdAt: -1 });
    return NextResponse.json({ problems });
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

    const problem = await ProblemStatement.create({ title, description });
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

    await ProblemStatement.findByIdAndDelete(id);
    return NextResponse.json({ message: "Problem statement deleted" });
  } catch (error) {
    console.error("Delete problem error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
