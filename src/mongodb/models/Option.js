import mongoose from "mongoose";

const optionSchema = new mongoose.mongoose.Schema(
  {
    question: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Question",
    },
    text: {
      type: String,
      ref: "Poll",
    },
    votes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  { timestamps: true }
);

export const Option = mongoose.model("Option", optionSchema);
