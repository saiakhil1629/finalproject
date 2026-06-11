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

export async function POST(req) {
  try {
    const isAdmin = await verifyAdmin(req);
    if (!isAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { projectId, status, adminComment } = await req.json();

    if (!projectId || !status) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    if (!["Approved", "Rejected", "Pending"].includes(status)) {
      return NextResponse.json({ error: "Invalid status value" }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("projects")
      .update({
        status,
        admin_comment: adminComment || ""
      })
      .eq("id", projectId)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ message: "Project reviewed successfully", project: data });
  } catch (error) {
    console.error("Project Review Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
