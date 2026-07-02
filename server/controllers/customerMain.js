import User from "../models/users.js";
import Request from "../models/requests.js";

const verifyOrderOwner = (request, userId, res) => {
  if (!request) {
    res.status(404).json({ message: "Request not found" });
    return false;
  }
  if (request.user.toString() !== userId.toString()) {
    res.status(403).json({ message: "Access denied" });
    return false;
  }
  return true;
};

export const getActiveOrders = async (req, res) => {
  try {
    const userId = req.userDetails.id;
    const activeOrders = await Request.find({
      user: userId,
      status: { $nin: ["Pending", "Completed", "Cancelled", "Paid"] },
    }).populate({
      path: "device",
      populate: {
        path: "model",
        select: "name img",
      },
    });
    res.status(200).json(activeOrders);
  } catch {
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getPendingOrders = async (req, res) => {
  try {
    const userId = req.userDetails.id;
    const pendingOrders = await Request.find({
      user: userId,
      status: "Pending",
    }).populate({
      path: "device",
      populate: {
        path: "model",
        select: "name img",
      },
    });
    res.status(200).json(pendingOrders);
  } catch {
    res.status(500).json({ message: "Internal server error" });
  }
};

export const latestUnpaidOrder = async (req, res) => {
  try {
    const userId = req.userDetails.id;
    const unpaidOrder = await Request.findOne({
      user: userId,
      status: { $nin: ["Pending", "Approved", "Paid", "PickedUp", "Completed", "Cancelled"] },
    })
      .sort({ createdAt: -1 })
      .populate({
        path: "device",
        populate: {
          path: "model",
          select: "name",
        },
      });

    if (!unpaidOrder) {
      return res.status(200).json({ message: "No unpaid orders found" });
    }
    res.status(200).json(unpaidOrder);
  } catch {
    res.status(500).json({ message: "Internal server error" });
  }
};

export const allOrders = async (req, res) => {
  try {
    const userId = req.userDetails.id;
    const orders = await Request.find({ user: userId }).populate({
      path: "device",
      populate: {
        path: "model",
        select: "name img",
      },
    });
    res.status(200).json(orders);
  } catch {
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getDetails = async (req, res) => {
  try {
    const userId = req.userDetails.id;
    const user = await User.findById(userId).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json(user);
  } catch {
    res.status(500).json({ message: "Internal server error" });
  }
};

export const updateDetails = async (req, res) => {
  try {
    const userId = req.userDetails.id;
    const user = await User.findById(userId);
    const { name, phone, email, dno, street, city, pincode } = req.body;
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (name) user.name = name;
    if (phone) user.phone = phone;
    if (email) user.email = email;

    if (dno || street || city || pincode) {
      user.address = user.address || {};
      if (dno) user.address.dno = dno;
      if (street) user.address.street = street;
      if (city) user.address.city = city;
      if (pincode) user.address.pincode = pincode;
    }

    await user.save();
    res.status(200).json({ message: "User details updated successfully" });
  } catch {
    res.status(500).json({ message: "Internal server error" });
  }
};

export const trackOrder = async (req, res) => {
  try {
    const requestId = req.params.reqId;
    const request = await Request.findById(requestId)
      .populate({
        path: "device",
        populate: {
          path: "model",
          select: "name img",
        },
      })
      .populate("assignedAgent", "name profilePicture phone");
    if (!verifyOrderOwner(request, req.userDetails.id, res)) return;
    res.status(200).json(request);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const cancelOrder = async (req, res) => {
  try {
    const requestId = req.params.reqId;
    const request = await Request.findById(requestId);
    if (!verifyOrderOwner(request, req.userDetails.id, res)) return;
    if (request.status !== "Pending") {
      return res.status(400).json({ message: "Only pending orders can be cancelled" });
    }
    request.status = "Cancelled";
    await request.save();
    return res.status(200).json({ message: "Request cancelled successfully" });
  } catch {
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getPackages = async (req, res) => {
  try {
    const requestId = req.params.reqId;
    const request = await Request.findById(requestId).populate({
      path: "device",
      populate: {
        path: "model",
        select: "name img",
      },
    });
    if (!verifyOrderOwner(request, req.userDetails.id, res)) return;

    const formatPackage = (pkgMap) => {
      if (!pkgMap || pkgMap.size === 0) return [];
      const entries = Object.fromEntries(pkgMap);
      return Object.entries(entries).map(([label, price]) => ({
        label,
        price,
      }));
    };

    const packages = {
      affordable: formatPackage(request.affordable),
      goodToHave: formatPackage(request.goodToHave),
      niceToHave: formatPackage(request.niceToHave),
    };

    return res.status(200).json({
      device: {
        modelName: request.device?.model?.name || "Unknown",
        modelImage: request.device?.model?.img || null,
      },
      packages,
    });
  } catch {
    res.status(500).json({ message: "Internal server error" });
  }
};

export const updatePackage = async (req, res) => {
  try {
    const { reqId, name } = req.params;
    const request = await Request.findById(reqId);
    if (!verifyOrderOwner(request, req.userDetails.id, res)) return;
    request.userPackage = name;
    await request.save();
    return res.status(200).json({ message: "Package updated successfully" });
  } catch {
    res.status(500).json({ message: "Internal server error" });
  }
};

export const requestById = async (req, res) => {
  try {
    const requestId = req.params.reqId;
    const request = await Request.findById(requestId);
    if (!verifyOrderOwner(request, req.userDetails.id, res)) return;
    return res.status(200).json(request);
  } catch {
    res.status(500).json({ message: "Internal server error" });
  }
};
