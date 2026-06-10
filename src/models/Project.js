import mongoose from "mongoose";

const ProjectSchema = new mongoose.Schema(
  {
    type: { type: String, enum: ["Mini", "Main"], required: true },
    submitterId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    teamId: { type: mongoose.Schema.Types.ObjectId, ref: "Team", default: null }, // Null for individual mini projects
    githubLink: { type: String, required: true },
    imageUrl: { type: String, required: true }, // We'll store a Base64 string or an external URL
  },
  { timestamps: true }
);

export default mongoose.models.Project || mongoose.model("Project", ProjectSchema);
