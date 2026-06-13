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

export const revalidate = 0;

export async function GET(req) {
  try {
    const isAdmin = await verifyAdmin(req);
    if (!isAdmin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const { data, error } = await supabase
      .from("linkedin_posts")
      .select(`
        id,
        link,
        created_at,
        user:users ( id, name, suc_number, campus )
      `)
      .order("created_at", { ascending: false });

    if (error) throw error;

    return NextResponse.json({ posts: data });
  } catch (error) {
    console.error("Admin LinkedIn Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
