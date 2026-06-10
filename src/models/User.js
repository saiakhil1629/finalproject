import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    sucNumber: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    section: { type: String, required: true },
    class: { type: String, required: true },
    rollNumber: { type: String, required: true },
    campus: { type: String, enum: ["Aditya KKD", "Aditya ASLW"], required: true },
    rating: { type: Number, min: 1, max: 5 },
    role: {
      type: String,
      enum: ["Admin", "Lead", "Member", "None"],
      default: "None",
    },
    teamId: { type: mongoose.Schema.Types.ObjectId, ref: "Team", default: null },
  },
  { timestamps: true }
);

export default mongoose.models.User || mongoose.model("User", UserSchema);
