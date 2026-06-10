import mongoose from "mongoose";

const ProblemStatementSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
  },
  { timestamps: true }
);

export default mongoose.models.ProblemStatement || mongoose.model("ProblemStatement", ProblemStatementSchema);
