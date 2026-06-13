import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import jwt from "jsonwebtoken";

export async function POST(req) {
  try {
    const token = req.cookies.get("token")?.value;
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.userId;

    const { link } = await req.json();
    if (!link || !link.includes("linkedin.com")) {
      return NextResponse.json({ error: "Please provide a valid LinkedIn link" }, { status: 400 });
    }

    // Check submission limit
    const { data: user, error: userError } = await supabase
      .from("users")
      .select("linkedin_submission_count")
      .eq("id", userId)
      .single();

    if (userError || !user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (user.linkedin_submission_count >= 5) {
      return NextResponse.json({ error: "You have reached the maximum limit of 5 submissions" }, { status: 400 });
    }

    // Insert the post
    const { error: insertError } = await supabase
      .from("linkedin_posts")
      .insert({ user_id: userId, link });

    if (insertError) throw insertError;

    // Increment count
    const { error: updateError } = await supabase
      .from("users")
      .update({ linkedin_submission_count: user.linkedin_submission_count + 1 })
      .eq("id", userId);

    if (updateError) throw updateError;

    return NextResponse.json({ message: "LinkedIn post submitted successfully!" }, { status: 201 });
  } catch (error) {
    console.error("LinkedIn Submit Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
