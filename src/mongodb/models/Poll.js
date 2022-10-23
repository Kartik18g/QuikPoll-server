import mongoose from "mongoose";

const pollSchema = new mongoose.mongoose.Schema({
  admin: [
    { 
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  ],
  questions: [
    { 
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Question'
    }
  ],
  users:[
    { 
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  ],
  status:{
    type: String,
    default:'inactive',
    enum: ['active', 'inactive'],
  }
}, { timestamps: true });

pollSchema.statics = {
  exists(id) {
    return this.findById(id).then((result) => {
      if (!result) throw new Error('poll not found');
    });
  },
};

export const Poll = mongoose.model("Poll", pollSchema);
