import mongoose from "mongoose";

const userSchema = new mongoose.mongoose.Schema(
  {
    name: {
      type: String,
    },
    blockedPolls:[
      // polls from which user has been banned
      {
        type:mongoose.Schema.Types.ObjectId,
        ref:"Poll"
      }
    ]
  },
  { timestamps: true }
);


userSchema.statics = {
  exists(id) {
    return this.findById(id).then((result) => {
      if (!result) throw new Error('user not found');
    });
  },
};


export const User = mongoose.model("User", userSchema);
