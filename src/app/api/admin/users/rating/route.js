import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function PATCH(req) {
  try {
    const { userId, newRating } = await req.json();

    if (!userId || typeof newRating !== "number") {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const { error } = await supabase
      .from("users")
      .update({ rating: newRating })
      .eq("id", userId);

    if (error) throw error;

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Update rating error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
