import mongoose from "mongoose";

const OrgSchema = new mongoose.Schema({
    Users: [{ isAdmin: Boolean, userId: String }],
    Name: String,
    RegValidation: [{ type: String, data: String }],
})
const model = mongoose.models.OrgSchema || mongoose.model("Org", OrgSchema);

export default model