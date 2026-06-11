import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import jwt from "jsonwebtoken";

export async function POST(req) {
  try {
    const token = req.cookies.get("token")?.value;
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Get user details
    const { data: user, error: userError } = await supabase
      .from("users")
      .select("*")
      .eq("id", decoded.userId)
      .single();

    if (userError || !user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const { type, githubLink, imageUrl } = await req.json();

    if (!type || !githubLink || !imageUrl) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    if (type === "Main") {
      if (user.role !== "Lead" || !user.team_id) {
        return NextResponse.json({ error: "Only team leads can submit the main project" }, { status: 403 });
      }
    }

    // Check if project already submitted
    let existingProject = null;
    if (type === "Main") {
      const { data } = await supabase
        .from("projects")
        .select("id")
        .eq("type", "Main")
        .eq("team_id", user.team_id)
        .maybeSingle();
      existingProject = data;
    } else {
      const { data } = await supabase
        .from("projects")
        .select("id")
        .eq("type", "Mini")
        .eq("submitter_id", user.id)
        .maybeSingle();
      existingProject = data;
    }

    if (existingProject) {
      return NextResponse.json({ error: `${type} Project has already been submitted.` }, { status: 400 });
    }

    let finalImageUrl = imageUrl;

    // Check if the imageUrl is a base64 string and process storage upload
    if (imageUrl && imageUrl.startsWith("data:image/")) {
      try {
        const base64Data = imageUrl.replace(/^data:image\/\w+;base64,/, "");
        const buffer = Buffer.from(base64Data, "base64");
        const mimeType = imageUrl.split(";")[0].split(":")[1];
        const fileExt = mimeType.split("/")[1] || "png";
        const fileName = `${type.toLowerCase()}-${user.id}-${Date.now()}.${fileExt}`;

        // Upload to Supabase Storage 'project-screenshots' bucket
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from("project-screenshots")
          .upload(fileName, buffer, {
            contentType: mimeType,
            upsert: true,
          });

        if (uploadError) {
          console.error("Storage upload failed, using base64 fallback:", uploadError);
        } else {
          const { data: { publicUrl } } = supabase.storage
            .from("project-screenshots")
            .getPublicUrl(fileName);
          finalImageUrl = publicUrl;
        }
      } catch (storageErr) {
        console.error("Error processing image upload, using base64 fallback:", storageErr);
      }
    }

    // Insert new project submission
    const { data: project, error: insertError } = await supabase
      .from("projects")
      .insert({
        type,
        submitter_id: user.id,
        team_id: type === "Main" ? user.team_id : null,
        github_link: githubLink,
        image_url: finalImageUrl,
      })
      .select()
      .single();

    if (insertError) throw insertError;

    return NextResponse.json({ message: `${type} Project submitted successfully!`, project }, { status: 201 });
  } catch (error) {
    console.error("Project Submit Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
