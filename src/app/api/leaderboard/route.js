import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export const revalidate = 60; // Cache for 60 seconds to prevent spamming the database

export async function GET() {
  try {
    const { data: users, error } = await supabase
      .from("users")
      .select("id, name, campus, rating, team_id")
      .order("rating", { ascending: false })
      .order("created_at", { ascending: true })
      .limit(50); // Fetch top 50 students

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ leaderboard: users }, { status: 200 });
  } catch (error) {
    console.error("Leaderboard Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
