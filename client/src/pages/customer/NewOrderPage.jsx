import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  getCategories,
  getCompanies,
  getModels,
  createOrder,
} from "../../services/api";

export default function NewOrderPage() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [models, setModels] = useState([]);

  const [category, setCategory] = useState("");
  const [company, setCompany] = useState("");
  const [modelname, setModelname] = useState("");
  const [warranty, setWarranty] = useState("No");
  const [imeiNumber, setImeiNumber] = useState("");
  const [issue, setIssue] = useState("");
  const [invoice, setInvoice] = useState(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    getCategories()
      .then(setCategories)
      .catch(() => setCategories(["Smartphones", "Tablets", "Laptops"]));
  }, []);

  useEffect(() => {
    if (!category) {
      setCompanies([]);
      setCompany("");
      return;
    }
    getCompanies(category)
      .then((data) => {
        setCompanies(data);
        setCompany("");
        setModelname("");
      })
      .catch(() => setCompanies([]));
  }, [category]);

  useEffect(() => {
    if (!category || !company) {
      setModels([]);
      setModelname("");
      return;
    }
    getModels(category, company)
      .then((data) => {
        setModels(data);
        setModelname("");
      })
      .catch(() => setModels([]));
  }, [category, company]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!invoice) {
      setError("Please upload your purchase invoice (PDF).");
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("modelname", modelname);
      formData.append("warranty", warranty);
      formData.append("imeiNumber", imeiNumber.trim());
      formData.append("issue", issue.trim());
      formData.append("invoice", invoice);

      const order = await createOrder(formData);
      navigate(`/customer/orders/${order._id}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1 className="dash-page-title">Schedule Repair Pickup</h1>
      <p className="dash-page-subtitle">
        Fill in your device details and we&apos;ll arrange doorstep pickup.
      </p>

      {error && <p className="dash-error">{error}</p>}

      <form className="dash-form dash-detail-card" onSubmit={handleSubmit}>
        <div className="dash-form-group">
          <label className="dash-form-label">Device Category</label>
          <select
            className="dash-form-select"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            required
          >
            <option value="">Select category</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        <div className="dash-form-group">
          <label className="dash-form-label">Brand / Company</label>
          <select
            className="dash-form-select"
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            required
            disabled={!category}
          >
            <option value="">Select company</option>
            {companies.map((c) => (
              <option key={c._id} value={c.name}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <div className="dash-form-group">
          <label className="dash-form-label">Device Model</label>
          <select
            className="dash-form-select"
            value={modelname}
            onChange={(e) => setModelname(e.target.value)}
            required
            disabled={!company}
          >
            <option value="">Select model</option>
            {models.map((m) => (
              <option key={m._id} value={m.name}>
                {m.name}
              </option>
            ))}
          </select>
        </div>

        <div className="dash-form-group">
          <label className="dash-form-label">Under Warranty?</label>
          <select
            className="dash-form-select"
            value={warranty}
            onChange={(e) => setWarranty(e.target.value)}
          >
            <option value="Yes">Yes</option>
            <option value="No">No</option>
          </select>
        </div>

        <div className="dash-form-group">
          <label className="dash-form-label">IMEI / Serial Number</label>
          <input
            className="dash-form-input"
            value={imeiNumber}
            onChange={(e) => setImeiNumber(e.target.value)}
            placeholder="Enter IMEI or serial number"
            required
          />
        </div>

        <div className="dash-form-group">
          <label className="dash-form-label">Describe the Issue</label>
          <textarea
            className="dash-form-textarea"
            value={issue}
            onChange={(e) => setIssue(e.target.value)}
            placeholder="What problem are you facing with your device?"
            required
          />
        </div>

        <div className="dash-form-group">
          <label className="dash-form-label">Purchase Invoice (PDF)</label>
          <input
            className="dash-form-input"
            type="file"
            accept="application/pdf"
            onChange={(e) => setInvoice(e.target.files?.[0] || null)}
            required
          />
        </div>

        <div className="dash-actions">
          <button type="submit" className="dash-btn dash-btn--primary" disabled={loading}>
            {loading ? "Submitting..." : "Submit Repair Request"}
          </button>
          <button
            type="button"
            className="dash-btn dash-btn--ghost"
            onClick={() => navigate("/customer/orders")}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
