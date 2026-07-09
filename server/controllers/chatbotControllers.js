const AAMIGOS_CONTEXT = `
AAMigos is a MERN stack smart device repair and pickup platform.
It supports customer and agent portals with email/password JWT authentication.
Customers sign up, complete onboarding, create repair pickup requests, upload an invoice, track order status, cancel pending requests, and select repair packages when available.
Agents sign up, complete onboarding and KYC, review pending pickup requests, approve and assign requests to themselves, manage ongoing repairs, set package options, approve warranty free service, and advance request status.
The main repair status flow is Pending, Approved, PickedUp, FreeApproval, InRepair, Delivering, Paid, Completed, with Cancelled allowed for customer cancellation while Pending.
Current uploads use Cloudinary for profile photos and invoice PDFs.
Payment and transaction models are present as coming soon future payment integration.
The chatbot must only answer questions about AAMigos project overview, features, modules, user workflow, use cases, FAQs, and how existing functionality works.
`;

const SYSTEM_PROMPT = `
You are the AAMigos project assistant.
Answer only questions related to the AAMigos project.
If the user asks about anything unrelated to AAMigos, politely say that you can only answer AAMigos project-related questions.
Keep answers concise, clear, and useful for a user or developer of the project.

Project context:
${AAMIGOS_CONTEXT}
`;

const normalizeHistory = (history = []) => {
  if (!Array.isArray(history)) return [];

  return history
    .filter((item) => ["user", "assistant"].includes(item?.role) && typeof item?.content === "string")
    .slice(-10)
    .map((item) => ({
      role: item.role,
      content: item.content.slice(0, 1200),
    }));
};

export const sendChatbotMessage = async (req, res) => {
  try {
    const { message, history } = req.body;

    if (!message?.trim()) {
      return res.status(400).json({ message: "Message is required" });
    }

    if (!process.env.GROQ_API_KEY?.trim()) {
      return res.status(500).json({ message: "Groq API key is not configured" });
    }

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: process.env.GROQ_MODEL || "llama-3.1-8b-instant",
        temperature: 0.2,
        max_tokens: 450,
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          ...normalizeHistory(history),
          { role: "user", content: message.trim().slice(0, 1200) },
        ],
      }),
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      return res.status(response.status).json({
        message: data?.error?.message || "Unable to get chatbot response",
      });
    }

    const reply = data?.choices?.[0]?.message?.content?.trim();
    if (!reply) {
      return res.status(502).json({ message: "Chatbot returned an empty response" });
    }

    return res.status(200).json({ reply });
  } catch {
    return res.status(500).json({ message: "Unable to reach chatbot service" });
  }
};
