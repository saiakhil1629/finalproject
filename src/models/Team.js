import mongoose from "mongoose";

const TeamSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    leadId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    joinCode: { type: String, required: true, unique: true },
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    maxSize: { type: Number, required: true, min: 3, max: 5 },
  },
  { timestamps: true }
);

export default mongoose.models.Team || mongoose.model("Team", TeamSchema);
