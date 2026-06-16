import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { supabase } from "@/lib/supabase";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(req) {
  try {
    const token = req.cookies.get("token")?.value;
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Select user details and perform a join on the 'teams' table
    let user = null;
    let error = null;

    // Try fallback options due to duplicate foreign key constraints in user DB setup
    const res1 = await supabase
      .from("users")
      .select("*, teamId:teams!fk_users_team_id(*)")
      .eq("id", decoded.userId)
      .maybeSingle();

    if (!res1.error) {
      user = res1.data;
    } else {
      const res2 = await supabase
        .from("users")
        .select("*, teamId:teams!users_team_id_fkey(*)")
        .eq("id", decoded.userId)
        .maybeSingle();

      if (!res2.error) {
        user = res2.data;
      } else {
        const res3 = await supabase
          .from("users")
          .select("*, teamId:teams!team_id(*)")
          .eq("id", decoded.userId)
          .maybeSingle();

        if (res3.error) throw res3.error;
        user = res3.data;
      }
    }
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Clean sensitive properties
    delete user.password;

    // Adjust the campus casing or snake_case key structures if needed
    // Map database properties (e.g. suc_number) to match frontend camelCase if needed,
    // or we can adjust it directly.
    user.sucNumber = user.suc_number;
    user.rollNumber = user.roll_number;

    return NextResponse.json({ user });
  } catch (error) {
    console.error("Auth Me Error:", error);
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
