import mongoose from "mongoose";

const TagSchema = new mongoose.Schema({
    Name: String,
    Color: String
})
const model = mongoose.models.Tags || mongoose.model("Tags", TagSchema);
export default model