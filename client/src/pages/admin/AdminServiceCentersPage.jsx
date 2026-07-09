import { useEffect, useState } from "react";
import { createAdminServiceCenter, getAdminCatalog, getAdminServiceCenters } from "../../services/api";

const initialForm = {
  name: "",
  city: "",
  street: "",
  pincode: "",
  contactNumber: "",
  companyId: "",
};

export default function AdminServiceCentersPage() {
  const [serviceCenters, setServiceCenters] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const load = async () => {
    const [centers, catalog] = await Promise.all([getAdminServiceCenters(), getAdminCatalog()]);
    setServiceCenters(centers);
    setCompanies(catalog.companies || []);
  };

  useEffect(() => {
    load()
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const updateField = (key, value) => setForm((current) => ({ ...current, [key]: value }));

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    setMessage("");
    try {
      await createAdminServiceCenter({
        name: form.name,
        city: form.city,
        street: form.street,
        pincode: form.pincode,
        contactNumber: form.contactNumber,
        companyIds: [form.companyId],
      });
      setForm(initialForm);
      setMessage("Service center added successfully");
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p className="dash-loading">Loading service centers...</p>;

  return (
    <div>
      <h1 className="dash-page-title">Service Centers</h1>
      <p className="dash-page-subtitle">Add and review authorized service centers for supported companies.</p>
      {error && <p className="dash-error">{error}</p>}
      {message && <p className="dash-success">{message}</p>}

      <form className="dash-form dash-detail-card" onSubmit={handleSubmit}>
        <h2 className="dash-detail-card__title">Add Service Center</h2>
        <div className="dash-admin-grid">
          <div className="dash-form-group">
            <label className="dash-form-label">Name</label>
            <input className="dash-form-input" value={form.name} onChange={(e) => updateField("name", e.target.value)} required />
          </div>
          <div className="dash-form-group">
            <label className="dash-form-label">Company</label>
            <select className="dash-form-select" value={form.companyId} onChange={(e) => updateField("companyId", e.target.value)} required>
              <option value="">Select company</option>
              {companies.map((company) => (
                <option key={company._id} value={company._id}>{company.name}</option>
              ))}
            </select>
          </div>
          <div className="dash-form-group">
            <label className="dash-form-label">City</label>
            <input className="dash-form-input" value={form.city} onChange={(e) => updateField("city", e.target.value)} required />
          </div>
          <div className="dash-form-group">
            <label className="dash-form-label">Street</label>
            <input className="dash-form-input" value={form.street} onChange={(e) => updateField("street", e.target.value)} required />
          </div>
          <div className="dash-form-group">
            <label className="dash-form-label">Pincode</label>
            <input className="dash-form-input" value={form.pincode} onChange={(e) => updateField("pincode", e.target.value)} required />
          </div>
          <div className="dash-form-group">
            <label className="dash-form-label">Contact Number</label>
            <input className="dash-form-input" value={form.contactNumber} onChange={(e) => updateField("contactNumber", e.target.value)} />
          </div>
        </div>
        <button type="submit" className="dash-btn dash-btn--primary" disabled={saving}>
          {saving ? "Saving..." : "Add Service Center"}
        </button>
      </form>

      <div className="dash-list">
        {serviceCenters.map((center) => (
          <div key={center._id} className="dash-detail-card">
            <h2 className="dash-detail-card__title">{center.name}</h2>
            <div className="dash-detail-row">
              <span className="dash-detail-row__label">Companies</span>
              <span>{center.companies?.map((company) => company.name).join(", ") || "-"}</span>
            </div>
            <div className="dash-detail-row">
              <span className="dash-detail-row__label">Address</span>
              <span>{[center.address?.street, center.address?.city, center.address?.pincode].filter(Boolean).join(", ")}</span>
            </div>
            <div className="dash-detail-row">
              <span className="dash-detail-row__label">Contact</span>
              <span>{center.contactNumber || "-"}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
