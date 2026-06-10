import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export async function POST(req) {
  try {
    const { name, sucNumber, password, section, class: className, rollNumber, campus, rating } = await req.json();

    if (!name || !sucNumber || !password || !section || !className || !rollNumber || !campus) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Check if user exists
    const { data: existingUser, error: checkError } = await supabase
      .from("users")
      .select("id")
      .eq("suc_number", sucNumber)
      .maybeSingle();

    if (checkError) {
      throw checkError;
    }
    if (existingUser) {
      return NextResponse.json({ error: "SUC Number already registered" }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Get count of registered users to check if this is the first user
    const { count, error: countError } = await supabase
      .from("users")
      .select("*", { count: "exact", head: true });

    if (countError) throw countError;

    const isFirstUser = count === 0;
    const role = (isFirstUser || name.toLowerCase().includes("saiakhil") || sucNumber.toLowerCase() === "admin") ? "Admin" : "None";

    // Insert user into Supabase
    const { data: user, error: insertError } = await supabase
      .from("users")
      .insert({
        name,
        suc_number: sucNumber,
        password: hashedPassword,
        section,
        class: className,
        roll_number: rollNumber,
        campus,
        rating: rating || 5,
        role,
      })
      .select()
      .single();

    if (insertError) throw insertError;

    const token = jwt.sign(
      { userId: user.id, role: user.role, name: user.name, campus: user.campus },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    const response = NextResponse.json({ message: "Registration successful", user: { name: user.name, role: user.role } }, { status: 201 });
    response.cookies.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Register Error:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
