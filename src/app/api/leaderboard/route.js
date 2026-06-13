import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export const dynamic = 'force-dynamic';
export const revalidate = 0; // Fetch fresh data for accurate leaderboard calculation

export async function GET() {
  try {
    // Fetch users and their projects to calculate score
    const { data: users, error } = await supabase
      .from("users")
      .select("id, name, campus, rating, linkedin_score, projects(id, type, status)");

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Calculate score for each user
    const leaderboardWithScores = users.map(user => {
      let miniCount = 0;
      let mainCount = 0;
      
      if (user.projects && user.projects.length > 0) {
        user.projects.forEach(p => {
          if (p.status === "Approved") {
            if (p.type === "Mini") miniCount++;
            if (p.type === "Main") mainCount++;
          }
        });
      }

      // Calculation: Mini = 10, Main = 20, LinkedIn Score = linkedin_score
      const score = (miniCount * 10) + (mainCount * 20) + (user.linkedin_score || 0);
      
      return {
        id: user.id,
        name: user.name,
        campus: user.campus,
        miniCount,
        mainCount,
        linkedinScore: user.linkedin_score || 0,
        score
      };
    });

    // Sort by score DESC
    leaderboardWithScores.sort((a, b) => b.score - a.score);

    // Limit to top 50
    const top50 = leaderboardWithScores.slice(0, 50);

    return NextResponse.json({ leaderboard: top50 }, { status: 200 });
  } catch (error) {
    console.error("Leaderboard Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
