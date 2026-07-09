import Agent from "../models/agents.js";
import Company from "../models/companies.js";
import DeviceCategory from "../models/deviceCategories.js";
import DeviceModel from "../models/deviceModels.js";
import Request from "../models/requests.js";
import ServiceCenter from "../models/serviceCenters.js";
import User from "../models/users.js";

export const getDetails = async (req, res) => {
  res.status(200).json({
    _id: req.admin._id,
    name: req.admin.name,
    email: req.admin.email,
    role: "admin",
  });
};

export const getStats = async (_req, res) => {
  try {
    const [customers, agents, requests, serviceCenters, companies, models] = await Promise.all([
      User.countDocuments(),
      Agent.countDocuments(),
      Request.countDocuments(),
      ServiceCenter.countDocuments(),
      Company.countDocuments(),
      DeviceModel.countDocuments(),
    ]);

    const byStatus = await Request.aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]);

    res.status(200).json({
      customers,
      agents,
      requests,
      serviceCenters,
      companies,
      models,
      byStatus,
    });
  } catch {
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getAgents = async (_req, res) => {
  try {
    const agents = await Agent.find()
      .select("-password")
      .populate("assignedRequests", "status createdAt")
      .sort({ name: 1, email: 1 });
    res.status(200).json(agents);
  } catch {
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getServiceCenters = async (_req, res) => {
  try {
    const serviceCenters = await ServiceCenter.find()
      .populate("companies", "name")
      .sort({ name: 1 });
    res.status(200).json(serviceCenters);
  } catch {
    res.status(500).json({ message: "Internal server error" });
  }
};

export const createServiceCenter = async (req, res) => {
  try {
    const { name, city, street, pincode, contactNumber, companyIds } = req.body;
    const companies = Array.isArray(companyIds) ? companyIds : [];

    if (!name?.trim() || !city?.trim() || !street?.trim() || !pincode?.trim() || companies.length === 0) {
      return res.status(400).json({ message: "Name, city, address, pincode, and company are required" });
    }

    const serviceCenter = await ServiceCenter.create({
      name: name.trim(),
      city: city.trim(),
      companies,
      address: {
        street: street.trim(),
        city: city.trim(),
        pincode: pincode.trim(),
      },
      contactNumber: contactNumber?.trim(),
    });

    await Company.updateMany(
      { _id: { $in: companies } },
      { $addToSet: { serviceCenters: serviceCenter._id } },
    );

    res.status(201).json(serviceCenter);
  } catch {
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getCatalog = async (_req, res) => {
  try {
    const [categories, companies, models, serviceCenters] = await Promise.all([
      DeviceCategory.find().sort({ name: 1 }),
      Company.find().populate("categories", "name").sort({ name: 1 }),
      DeviceModel.find().populate("category", "name").populate("company", "name").sort({ name: 1 }),
      ServiceCenter.find().populate("companies", "name").sort({ name: 1 }),
    ]);

    res.status(200).json({ categories, companies, models, serviceCenters });
  } catch {
    res.status(500).json({ message: "Internal server error" });
  }
};

export const createCompany = async (req, res) => {
  try {
    const { name, categoryIds } = req.body;
    const categories = Array.isArray(categoryIds) ? categoryIds : [];

    if (!name?.trim() || categories.length === 0) {
      return res.status(400).json({ message: "Company name and category are required" });
    }

    const company = await Company.create({ name: name.trim(), categories });
    await DeviceCategory.updateMany(
      { _id: { $in: categories } },
      { $addToSet: { companies: company._id } },
    );

    res.status(201).json(company);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: "Company already exists" });
    }
    res.status(500).json({ message: "Internal server error" });
  }
};

export const createModel = async (req, res) => {
  try {
    const { name, img, companyId, categoryId } = req.body;

    if (!name?.trim() || !companyId || !categoryId) {
      return res.status(400).json({ message: "Model name, company, and category are required" });
    }

    const model = await DeviceModel.create({
      name: name.trim(),
      img: img?.trim() || "",
      company: companyId,
      category: categoryId,
    });

    await Company.findByIdAndUpdate(companyId, { $addToSet: { models: model._id } });

    res.status(201).json(model);
  } catch {
    res.status(500).json({ message: "Internal server error" });
  }
};
