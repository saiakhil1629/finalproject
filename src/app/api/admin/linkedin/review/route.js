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
    if (!isAdmin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const { postId, userId, score } = await req.json();

    if (!postId || !userId || score === undefined || score < 1 || score > 5) {
      return NextResponse.json({ error: "Invalid data. Score must be between 1 and 5." }, { status: 400 });
    }

    // 1. Fetch current linkedin score of the user
    const { data: user, error: userError } = await supabase
      .from("users")
      .select("linkedin_score")
      .eq("id", userId)
      .single();

    if (userError) throw userError;

    // 2. Add new score to user's linkedin score
    const newScore = (user.linkedin_score || 0) + parseInt(score);
    const { error: updateError } = await supabase
      .from("users")
      .update({ linkedin_score: newScore })
      .eq("id", userId);

    if (updateError) throw updateError;

    // 3. Delete the post from linkedin_posts table
    const { error: deleteError } = await supabase
      .from("linkedin_posts")
      .delete()
      .eq("id", postId);

    if (deleteError) throw deleteError;

    return NextResponse.json({ message: "Review submitted successfully!" });
  } catch (error) {
    console.error("Admin LinkedIn Review Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
