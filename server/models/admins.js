import mongoose from "mongoose";

const adminSchema = new mongoose.Schema({
  name: { type: String, default: "Admin" },
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

const Admin = mongoose.model("Admin", adminSchema);

export default Admin;
