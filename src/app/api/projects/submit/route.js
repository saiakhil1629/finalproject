import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import jwt from "jsonwebtoken";

export const maxDuration = 60; // Set max execution time to 60 seconds

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
    if (type === "Main") {
      const { data } = await supabase
        .from("projects")
        .select("id")
        .eq("type", "Main")
        .eq("team_id", user.team_id)
        .maybeSingle();
        
      if (data) {
        return NextResponse.json({ error: "Main Project has already been submitted." }, { status: 400 });
      }
    } else {
      const { count } = await supabase
        .from("projects")
        .select("id", { count: "exact", head: true })
        .eq("type", "Mini")
        .eq("submitter_id", user.id);
        
      if (count >= 2) {
        return NextResponse.json({ error: "Maximum of 2 Mini Projects allowed." }, { status: 400 });
      }
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

    if (insertError) {
      console.error("Database Insert Error:", insertError);
      return NextResponse.json({ error: insertError.message || "Database insert failed" }, { status: 500 });
    }

    return NextResponse.json({ message: `${type} Project submitted successfully!`, project }, { status: 201 });
  } catch (error) {
    console.error("Project Submit Error:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}

export async function PUT(req) {
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

    const { id, githubLink, imageUrl } = await req.json();

    if (!id || !githubLink || !imageUrl) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Fetch the project to verify ownership and type
    const { data: project, error: fetchError } = await supabase
      .from("projects")
      .select("*")
      .eq("id", id)
      .single();

    if (fetchError || !project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    // Authorization checks
    if (project.type === "Main") {
      if (user.role !== "Lead" || !user.team_id || user.team_id !== project.team_id) {
        return NextResponse.json({ error: "Only team leads can edit the main project" }, { status: 403 });
      }
    } else {
      if (project.submitter_id !== user.id) {
        return NextResponse.json({ error: "You are not authorized to edit this mini project submission" }, { status: 403 });
      }
    }

    let finalImageUrl = imageUrl;

    // Check if the new imageUrl is a base64 string and process storage upload
    if (imageUrl && imageUrl.startsWith("data:image/")) {
      try {
        const base64Data = imageUrl.replace(/^data:image\/\w+;base64,/, "");
        const buffer = Buffer.from(base64Data, "base64");
        const mimeType = imageUrl.split(";")[0].split(":")[1];
        const fileExt = mimeType.split("/")[1] || "png";
        const fileName = `${project.type.toLowerCase()}-${user.id}-${Date.now()}.${fileExt}`;

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

    // Update project submission details
    const { data: updatedProject, error: updateError } = await supabase
      .from("projects")
      .update({
        github_link: githubLink,
        image_url: finalImageUrl,
        status: "Pending", // reset status to Pending review
        admin_comment: "", // clear admin comment
      })
      .eq("id", id)
      .select()
      .single();

    if (updateError) {
      console.error("Database Update Error:", updateError);
      return NextResponse.json({ error: updateError.message || "Database update failed" }, { status: 500 });
    }

    return NextResponse.json({ message: `${project.type} Project updated successfully!`, project: updatedProject }, { status: 200 });
  } catch (error) {
    console.error("Project Update Error:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}

