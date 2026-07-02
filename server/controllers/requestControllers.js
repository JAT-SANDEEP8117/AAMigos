import Request from "../models/requests.js";
import Device from "../models/devices.js";
import DeviceModel from "../models/deviceModels.js";
import Company from "../models/companies.js";
import DeviceCategory from "../models/deviceCategories.js";
import ServiceCenter from "../models/serviceCenters.js";

export const getCategories = async (_req, res) => {
  try {
    const categories = await DeviceCategory.find().select("name").sort({ name: 1 });
    res.status(200).json(categories.map((c) => c.name));
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
    const companies = await Company.find({ categories: requiredCategory._id });
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

    const requiredCompany = await Company.findOne({ name: company });
    if (!requiredCompany) {
      return res.status(404).json({ message: "Company not found" });
    }

    const deviceModels = await DeviceModel.find({
      company: requiredCompany._id,
      category: requiredCategory._id,
    });
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
    const { modelname, warranty, imeiNumber, issue } = req.body;
    if (!modelname || !warranty || !imeiNumber || !issue || !req.file) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const model = await DeviceModel.findOne({ name: modelname });
    if (!model) {
      return res.status(404).json({ message: "Device model not found" });
    }

    const warrantyStatus = warranty === "Yes";

    const newDevice = await Device.create({
      imeiNumber,
      model: model._id,
      owner: req.userDetails.id,
      warranty: warrantyStatus,
      issue,
      invoicePdfUrl: req.file.path,
    });

    const company = await Company.findById(model.company);
    if (!company) {
      return res.status(404).json({ message: "Company not found for this model" });
    }

    const serviceCenter = await ServiceCenter.findOne({ companies: company._id });
    if (!serviceCenter) {
      return res.status(404).json({ message: "No service center available for this device" });
    }

    const newRequest = await Request.create({
      user: req.userDetails.id,
      device: newDevice._id,
      status: "Pending",
      selectedServiceCenter: serviceCenter._id,
    });

    res.status(201).json(newRequest);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
