import mongoose from "mongoose";

const deviceSchema = new mongoose.Schema({
  imeiNumber: { type: String, unique: true, required: true },
  invoicePdfUrl: String,
  // Catalog devices retain their model reference. Custom-brand devices keep the
  // submitted names below so a customer can still create a valid request.
  model: { type: mongoose.Schema.Types.ObjectId, ref: "DeviceModel" },
  brandName: { type: String, required: true, trim: true },
  modelName: { type: String, required: true, trim: true },
  category: { type: String, enum: ["Smartphones", "Laptops", "Tablets"], required: true },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  warranty: { type: Boolean, required: true },
  issue : {type : String, required : true}
});
const Device = mongoose.model("Device", deviceSchema);
export default Device;
