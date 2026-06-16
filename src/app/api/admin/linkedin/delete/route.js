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

export async function DELETE(req) {
  try {
    const isAdmin = await verifyAdmin(req);
    if (!isAdmin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const { postId } = await req.json();

    if (!postId) {
      return NextResponse.json({ error: "Post ID is required" }, { status: 400 });
    }

    const { error: deleteError } = await supabase
      .from("linkedin_posts")
      .delete()
      .eq("id", postId);

    if (deleteError) throw deleteError;

    return NextResponse.json({ message: "Post deleted successfully!" });
  } catch (error) {
    console.error("Admin LinkedIn Delete Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
