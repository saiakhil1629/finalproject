import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { supabase } from "@/lib/supabase";

export async function GET(req) {
  try {
    const token = req.cookies.get("token")?.value;
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Select user details and perform a join on the 'teams' table
    const { data: user, error } = await supabase
      .from("users")
      .select("*, teamId:teams(*)")
      .eq("id", decoded.userId)
      .maybeSingle();

    if (error) throw error;
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
