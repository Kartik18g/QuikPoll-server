import mongoose from "mongoose";

const questionSchema = new mongoose.mongoose.Schema({
  poll: { 
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Poll'
  },
  text: { 
      type: "String"
  },
  duration:{
    type: Number,
    //deafault duration of a question is 30 seconds
    default: 30
  },
  options: [
    { 
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Option'
    }
  ],
  votes:[
    { 
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  ],
}, { timestamps: true });

export const Question = mongoose.model("Question", questionSchema);
