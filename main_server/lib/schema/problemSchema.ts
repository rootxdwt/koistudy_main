import mongoose from "mongoose";

const tcSchema = new mongoose.Schema({
    tl: Number,
    in: [String],
    out: [String]
})

const testSchema = new mongoose.Schema({
    Disallow: [String],
    TimeLimit:Number
})

const ProblemSchema = new mongoose.Schema({
    Mem: Number,
    ProblemCode: Number,
    ProblemName: String,
    Script: String,
    SupportedLang: [String],
    TestProgress: testSchema,
    rating: Number,
    solved: Number,
    submitted: Number,
    tags: [String]
})
const model = mongoose.models.Problems || mongoose.model("Problems", ProblemSchema);
export default model