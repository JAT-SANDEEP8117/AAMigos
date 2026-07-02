import Request from "../models/requests.js";
import Agent from "../models/agents.js";

export const getPendingRequests = async (req, res) => {
  try {
    const pendingRequests = await Request.find({ status: "Pending" })
      .populate("user", "name profilePicture phone address")
      .populate({
        path: "device",
        populate: { path: "model", select: "name img" },
      })
      .sort({ createdAt: -1 });
    res.status(200).json(pendingRequests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const approveRequest = async (req, res) => {
  try {
    const requestId = req.params.reqId;
    const request = await Request.findById(requestId);
    if (!request) {
      return res.status(404).json({ message: "Request not found" });
    }
    request.status = "Approved";
    request.assignedAgent = req.agent._id;
    await request.save();
    res.status(200).json({ message: "Request approved successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getOngoingRequests = async (req, res) => {
  try {
    const agentId = req.agent._id;
    const ongoingRequests = await Request.find({
      status: { $nin: ["Pending", "Completed", "Cancelled"] },
      assignedAgent: agentId,
    }).populate({
      path: "device",
      populate: {
        path: "model",
        select: "name img",
      },
    });
    res.status(200).json(ongoingRequests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getAllAssignedRequests = async (req, res) => {
  try {
    const agentId = req.agent._id;
    const assignedRequests = await Request.find({ assignedAgent: agentId }).populate({
      path: "device",
      populate: {
        path: "model",
        select: "name img",
      },
    });
    res.status(200).json(assignedRequests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getDetails = async (req, res) => {
  try {
    const agentId = req.agent._id;
    const agent = await Agent.findById(agentId).select("-password");
    if (!agent) {
      return res.status(404).json({ message: "Agent not found" });
    }
    res.status(200).json(agent);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const editDetails = async (req, res) => {
  try {
    const { name, phone, email, dno, street, city, pincode, panCard, adhaarNumber } = req.body;
    const agentId = req.agent._id;
    const agent = await Agent.findById(agentId);
    if (!agent) {
      return res.status(404).json({ message: "Agent not found" });
    }

    if (name) agent.name = name;
    if (phone) agent.phone = phone;
    if (email) agent.email = email;

    if (dno || street || city || pincode) {
      agent.address = agent.address || {};
      if (dno) agent.address.dno = dno;
      if (street) agent.address.street = street;
      if (city) agent.address.city = city;
      if (pincode) agent.address.pincode = pincode;
    }

    if (panCard) agent.panCard = panCard;
    if (adhaarNumber) agent.aadharNumber = adhaarNumber;
    if (req.file) agent.profilePicture = req.file.path;

    await agent.save();
    res.status(200).json({ message: "Agent updated successfully" });
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
          populate: {
            path: "company",
            populate: {
              path: "serviceCenters",
            },
          },
        },
      })
      .populate("user", "name profilePicture phone address");
    if (!request) {
      return res.status(404).json({ message: "Request not found" });
    }
    res.status(200).json(request);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateStatus = async (req, res) => {
  try {
    const { reqId, status } = req.params;
    const request = await Request.findById(reqId);
    if (!request) {
      return res.status(404).json({ message: "Request not found" });
    }
    request.status = status;
    await request.save();
    res.status(200).json({ message: "Status updated successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const packages = async (req, res) => {
  try {
    const { affordable, goodToHave, niceToHave } = req.body;
    const { reqId } = req.params;
    const request = await Request.findById(reqId);
    if (!request) {
      return res.status(404).json({ message: "Request not found" });
    }

    const convertToMap = (list) => {
      const map = {};
      if (Array.isArray(list)) {
        list.forEach((item) => {
          map[item.label.trim()] = item.price;
        });
      }
      return map;
    };

    request.affordable = convertToMap(affordable);
    request.goodToHave = convertToMap(goodToHave);
    request.niceToHave = convertToMap(niceToHave);
    await request.save();
    res.status(200).json({ message: "Packages updated successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getPackage = async (req, res) => {
  try {
    const { reqId } = req.params;
    const request = await Request.findById(reqId).populate({
      path: "device",
      populate: {
        path: "model",
        select: "name img",
      },
    });
    if (!request) {
      return res.status(404).json({ message: "Request not found" });
    }
    res.status(200).json(request);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const freeService = async (req, res) => {
  try {
    const { reqId } = req.params;
    const request = await Request.findById(reqId);
    if (!request) {
      return res.status(404).json({ message: "Request not found" });
    }
    request.FreeService = true;
    await request.save();
    res.status(200).json({ message: "Free Service Updated successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
