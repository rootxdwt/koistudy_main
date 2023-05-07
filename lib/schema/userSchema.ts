import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
    Id: String,
    Mail: String,
    MailVerified: Boolean,
    Uid: String,
    PfpURL: { type: String, default: "https://cdn.ecdev.me/nwhny.png" },
    Champion: { type: [{ Code: String, Cat: String }], default: [] },
    Rank: { type: Number, default: 0 },
    isAdmin: { type: Boolean, default: false },
    Solved: { type: [String], dafault: [] },
    RegDate: { type: Date, default: Date.now }
})
export default mongoose.models.Users || mongoose.model("Users", UserSchema);