import Request from "../models/requests.js";
import Device from "../models/devices.js";
import DeviceModel from "../models/deviceModels.js";
import Company from "../models/companies.js";
import DeviceCategory from "../models/deviceCategories.js";
import ServiceCenter from "../models/serviceCenters.js";
import User from "../models/users.js";

export const getCategories = async (_req, res) => {
  try {
    const categories = await DeviceCategory.find({ name: { $in: ["Smartphones", "Laptops", "Tablets"] } }).select("name");
    const order = ["Smartphones", "Laptops", "Tablets"];
    res.status(200).json(categories.map((c) => c.name).sort((a, b) => order.indexOf(a) - order.indexOf(b)));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getCompanies = async (req, res) => {
  try {
    const { category } = req.params;
    const requiredCategory = await DeviceCategory.findOne({ name: category });
    if (!requiredCategory) {
      return res.status(404).json({ message: "Category not found" });
    }
    const companies = await Company.find({ categories: requiredCategory._id }).select("name").sort({ name: 1 });
    res.status(200).json(companies);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getModels = async (req, res) => {
  const { category, company } = req.params;
  try {
    const requiredCategory = await DeviceCategory.findOne({ name: category });
    if (!requiredCategory) {
      return res.status(404).json({ message: "Category not found" });
    }

    const requiredCompany = await Company.findOne({ name: company, categories: requiredCategory._id });
    if (!requiredCompany) {
      return res.status(404).json({ message: "Company not found" });
    }

    const deviceModels = await DeviceModel.find({
      company: requiredCompany._id,
      category: requiredCategory._id,
    }).select("name img").sort({ name: 1 });
    res.status(200).json(deviceModels);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getRequests = async (req, res) => {
  try {
    const requests = await Request.find({ user: req.userDetails.id })
      .populate("device")
      .populate("user");
    res.status(200).json(requests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const postRequest = async (req, res) => {
  try {
    const { category, company, modelId, modelname, warranty, imeiNumber, issue } = req.body;
    const cleanedImei = imeiNumber?.trim();
    const cleanedIssue = issue?.trim();
    const cleanedCompany = company?.trim();
    const cleanedModelName = modelname?.trim();
    const isCustomDevice = modelId === "other" || modelId === "manual";

    if (!category || !cleanedCompany || !cleanedModelName || !["Yes", "No"].includes(warranty) || !cleanedImei || !cleanedIssue || !req.file) {
      return res.status(400).json({ message: "All fields are required" });
    }
    if (!["Smartphones", "Laptops", "Tablets"].includes(category)) {
      return res.status(400).json({ message: "Unsupported device category" });
    }
    if (req.file.mimetype !== "application/pdf") {
      return res.status(400).json({ message: "Purchase invoice must be a PDF" });
    }

    const existingDevice = await Device.findOne({ imeiNumber: cleanedImei });
    if (existingDevice) {
      return res.status(400).json({ message: "A request already exists for this IMEI or serial number" });
    }

    let model = null;
    let serviceCenter = null;
    if (!isCustomDevice) {
      model = await DeviceModel.findById(modelId).populate("company", "name").populate("category", "name");
      if (!model || model.name !== cleanedModelName || model.company?.name !== cleanedCompany || model.category?.name !== category) {
        return res.status(400).json({ message: "Selected device details are invalid" });
      }
      serviceCenter = await ServiceCenter.findOne({ companies: model.company._id });
    } else if (modelId === "manual") {
      const catalogCompany = await Company.findOne({ name: cleanedCompany }).populate({ path: "categories", match: { name: category } });
      if (!catalogCompany?.categories?.length) {
        return res.status(400).json({ message: "Selected brand is not available for this category" });
      }
      serviceCenter = await ServiceCenter.findOne({ companies: catalogCompany._id });
    }

    const warrantyStatus = warranty === "Yes";

    const newDevice = await Device.create({
      imeiNumber: cleanedImei,
      ...(model ? { model: model._id } : {}),
      brandName: cleanedCompany,
      modelName: cleanedModelName,
      category,
      owner: req.userDetails.id,
      warranty: warrantyStatus,
      issue: cleanedIssue,
      invoicePdfUrl: req.file.path,
    });

    const newRequest = await Request.create({
      user: req.userDetails.id,
      device: newDevice._id,
      status: "Pending",
      ...(serviceCenter ? { selectedServiceCenter: serviceCenter._id } : {}),
    });

    await User.findByIdAndUpdate(req.userDetails.id, { $addToSet: { requests: newRequest._id } });

    res.status(201).json(newRequest);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
