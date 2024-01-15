
import sanitize from 'mongo-sanitize'
import mongoose from 'mongoose'
import UserModel from "../schema/userSchema.js"
import ProblemModel from "../schema/problemSchema.js"
import SubmissionSchema from '../schema/submissionSchema.js'
import { Judge } from "../judge/judgeInstance.js";
import { createClient } from 'redis'

export const config = {
  api: {
    bodyParser: false,
  },
};


const JudgePage = async (socket) => {
  const client = createClient();
  await client.connect();

  socket.on('feed', async msg => {
    const url = process.env.MONGOCONNSTR;
    if (!url) {
      socket.emit('error', "internal server error")
      socket.disconnect()
    }
    await mongoose.connect(url)

    const data = await ProblemModel.find({ ProblemCode: parseInt(sanitize(socket.data.prob_id)) })
    const { TestProgress, SupportedLang, Mem, ProblemCode } = JSON.parse(JSON.stringify(data[0]))

    if (SupportedLang.indexOf(msg.lang) == -1) {
      socket.emit('error', "unsupported language")
      socket.disconnect()
    }

    let isCorrect
    let databaseTCdata
    let container
    let isSuccess

    try {
      const judgeInstance = new Judge(msg.lang, Mem, 600000)
      container = await judgeInstance.CreateRunEnv(msg.codeData)
      await judgeInstance.compileCode(container)
      socket.emit("compile_end", "")

      const matchedCases = await judgeInstance.testCode(container, TestProgress.TimeLimit, ProblemCode, (a, b) => socket.emit("judge_progress", [a, b]))
      isCorrect = matchedCases.every(e => e.matched)

      databaseTCdata = matchedCases.map((elem) => {
        return { Mem: elem.memory, Time: elem.exect, State: elem.tle ? "TLE" : elem.matched ? "AC" : "AW" }
      })

      await SubmissionSchema.create({
        User: socket.data.uid,
        Code: sanitize(msg.codeData),
        Status: isCorrect ? 'AC' : 'AW',
        CodeLength: msg.codeData.length,
        TC: databaseTCdata,
        Prob: parseInt(sanitize(socket.data.prob_id)),
        SubCode: socket.data.sub_code,
        Lang: msg.lang
      })
      isSuccess = true

    } catch (e) {
      await client.del(socket.data.uid)

      let statement = e.message == "Compile error" ? "CE" : "ISE"
      await SubmissionSchema.create({
        User: socket.data.uid,
        Code: sanitize(msg.codeData),
        Status: e.message == "Compile error" ? "CE" : "ISE",
        CodeLength: msg.codeData.length,
        Prob: parseInt(sanitize(socket.data.prob_id)),
        SubCode: socket.data.sub_code,
        TC: [],
        Lang: msg.lang
      })
      isSuccess = false
    }

    await client.del(socket.data.uid)
    const updateOperations = [];

    updateOperations.push({
      updateOne: {
        filter: { Uid: socket.data.uid },
        update: { $addToSet: { Submitted: ProblemCode } }
      }
    });

    if (isCorrect) {
      updateOperations.push({
        updateOne: {
          filter: { Uid: socket.data.uid },
          update: { $addToSet: { Solved: ProblemCode } }
        }
      });
    }

    const result = await UserModel.bulkWrite(updateOperations);

    if (result.modifiedCount > 0) {
      const updatedProblem = await ProblemModel.findOne({ ProblemCode: ProblemCode }, "-_id submitted solved");
      let calculatedRating = Math.ceil(9 * (1 - (updatedProblem["solved"] / (updatedProblem["submitted"] + 1)) ** 2))
      let rating = updatedProblem["solved"] == 0 ? 10 : calculatedRating < 0 ? 1 : calculatedRating
      await ProblemModel.updateOne({ ProblemCode: ProblemCode }, { $inc: { submitted: 1 }, rating: rating });
      if (isCorrect) {
        await ProblemModel.updateOne({ ProblemCode: ProblemCode }, { $inc: { solved: 1 } });
      }
    }

    socket.emit(isSuccess ? "success" : "error", "")
    socket.disconnect()
  })
  socket.on('disconnect', async () => {

  })
}


export default JudgePage