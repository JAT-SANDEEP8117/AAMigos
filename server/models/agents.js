import mongoose from "mongoose";

const agentSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  profilePicture: String,
  phone: String,
  panCard: String,
  aadharNumber: String,
  address : {
    dno : String,
    street: String,
    city: String,
    pincode: String
    },
  assignedRequests: [{ type: mongoose.Schema.Types.ObjectId, ref: "Request" }]
});

const Agent = mongoose.model("Agent", agentSchema);
export default Agent;