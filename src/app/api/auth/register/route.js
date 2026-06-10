import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export async function POST(req) {
  try {
    await dbConnect();
    const { name, sucNumber, password, section, class: className, rollNumber, campus, rating } = await req.json();

    if (!name || !sucNumber || !password || !section || !className || !rollNumber || !campus) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const existingUser = await User.findOne({ sucNumber });
    if (existingUser) {
      return NextResponse.json({ error: "SUC Number already registered" }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Check if this is the first user; if so, make them Admin (saiakhil.g)
    // Or if SUC number is "admin" or matches a specific admin ID. We can make "admin" user or allow registration.
    // Let's make any user with name containing "saiakhil.g" or SUC "admin" an Admin.
    const isFirstUser = (await User.countDocuments({})) === 0;
    const role = (isFirstUser || name.toLowerCase().includes("saiakhil") || sucNumber.toLowerCase() === "admin") ? "Admin" : "None";

    const user = await User.create({
      name,
      sucNumber,
      password: hashedPassword,
      section,
      class: className,
      rollNumber,
      campus,
      rating: rating || 5,
      role,
    });

    const token = jwt.sign(
      { userId: user._id, role: user.role, name: user.name, campus: user.campus },
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
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
