import { Router } from "express";
import mongoose from "mongoose";
import { io } from "..";
import { Poll, Question, Option } from "../mongodb/models/index";
const router = Router();

router.get("/verifyAdmin/:pollId/:userId", async (req, res) => {
  try {
    const { userId, pollId } = req.params;
    const poll = await Poll.findOne({ _id: pollId });
    if (poll.admin == userId) {
      return res.json({
        message: "authorised",
        success: true,
        data: {
          isAdmin: true,
        },
      });
    } else {
      return res.json({
        message: "not authorised",
        success: true,
        data: {
          isAdmin: false,
        },
      });
    }
  } catch (error) {
    console.log(error);
    return res.json({
      message: "Something went wrong",
      success: false,
      data: {
        isAdmin: false,
      },
    });
  }
});

router.post("/", async (req, res) => {
  try {
    const { user } = req.body;
    const poll = new Poll({
      admin: [user],
      questions: [],
      users: [],
    });
    await poll.save();
    return res.json({
      message: "poll created successfully",
      success: true,
      data: {
        poll,
      },
    });
  } catch (error) {
    console.log(error);
    return res.json({
      message: "Something went wrong",
      success: false,
      data: {
        poll: null,
      },
    });
  }
});

router.post("/:id/addQuestion", async (req, res) => {
  try {
    const { id: pollId } = req.params;
    const { options, question, duration } = req.body;
    // check if previos question has timed out
    const questions = await Question.find(
      { poll: pollId },
      { _id: 1, duration: 1, createdAt: 1 },
      { sort: { createdAt: -1 } }
    );

    if (questions.length > 0) {
      const lastQuestion = questions[0];
      var currDate = new Date();
      var endDate = new Date(lastQuestion.createdAt);
      endDate.setSeconds(endDate.getSeconds() + lastQuestion.duration);
      if (currDate<endDate) {
        return res.json({
          message: "Previous question has not timed out",
          success: false,
          data: {
            question: null,
          },
        });
      }
    }

    const q = new Question({
      poll: pollId,
      duration,
      text: question,
    });
    await q.save();
    const optionsAdded = await Option.insertMany(
      options.map((o) => ({
        text: o,
        question: q._id,
      })),
      { rawResult: true }
    );

    const { insertedIds } = optionsAdded;
    await Question.updateOne(
      { _id: q._id },
      {
        $set: {
          options: Object.values(insertedIds),
        },
      }
    );

    await Poll.updateOne({ _id: pollId }, { $push: { questions: q._id } });
    // emit the question
    io.emit(`new-question/${pollId}`, q);

    return res.json({
      message: "question added successfully",
      success: true,
      data: {
        question: q,
      },
    });
  } catch (error) {
    console.log(error);
    return res.json({
      message: "Something went wrong",
      success: false,
      data: {
        question: CountQueuingStrategy,
      },
    });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const { id: pollId } = req.params;
    const poll = await Poll.aggregate([
      {
        $match: {
          $expr: {
            $eq: ["$_id", mongoose.Types.ObjectId(pollId)],
          },
        },
      },
      {
        $lookup: {
          from: "questions",
          let: { questions: "$questions" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $in: ["$_id", "$$questions"],
                },
              },
            },
            {
              $lookup: {
                from: "options",
                let: { options: "$options" },
                pipeline: [
                  {
                    $match: {
                      $expr: {
                        $in: ["$_id", "$$options"],
                      },
                    },
                  },
                ],
                as: "options",
              },
            },
          ],
          as: "questions",
        },
      },
    ]);
    return res.json({
      message: "poll fetched",
      success: true,
      data: {
        poll: poll,
      },
    });
  } catch (error) {
    console.log(error);
    return res.json({
      message: "Something went wrong",
      success: false,
      data: {
        poll: {},
      },
    });
  }
});

router.post("/:pollId/vote", async (req, res) => {
  try {
    const { pollId } = req.params;

    await Poll.updateOne(
      { _id: pollId },
      {
        $addToSet: {
          users: userId,
        },
      }
    );
    const { userId, questionId, optionId } = req.body;
    await Option.findByIdAndUpdate(
      optionId,
      {
        $addToSet: {
          votes: userId,
        },
      },
      { new: true }
    );
    await Question.findByIdAndUpdate(
      questionId,
      {
        $addToSet: {
          votes: userId,
        },
      },
      { new: true }
    );
    io.emit(`new-vote/${pollId}`, {});
    return res.json({
      message: "voted successfully",
      success: true,
      data: {},
    });
  } catch (error) {
    console.log(error);
    return res.json({
      message: "Something went wrong",
      success: false,
      data: {
        isAdmin: false,
      },
    });
  }
});

export default router;
