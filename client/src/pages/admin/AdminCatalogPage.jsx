import { useEffect, useState } from "react";
import { createAdminCompany, createAdminModel, getAdminCatalog } from "../../services/api";

const companyInitial = { name: "", categoryId: "" };
const modelInitial = { name: "", img: "", categoryId: "", companyId: "" };

export default function AdminCatalogPage() {
  const [catalog, setCatalog] = useState({ categories: [], companies: [], models: [] });
  const [companyForm, setCompanyForm] = useState(companyInitial);
  const [modelForm, setModelForm] = useState(modelInitial);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const load = async () => {
    const data = await getAdminCatalog();
    setCatalog(data);
  };

  useEffect(() => {
    load()
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const handleCompanySubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    setMessage("");
    try {
      await createAdminCompany({ name: companyForm.name, categoryIds: [companyForm.categoryId] });
      setCompanyForm(companyInitial);
      setMessage("Company added successfully");
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleModelSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    setMessage("");
    try {
      await createAdminModel({
        name: modelForm.name,
        img: modelForm.img,
        categoryId: modelForm.categoryId,
        companyId: modelForm.companyId,
      });
      setModelForm(modelInitial);
      setMessage("Device model added successfully");
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p className="dash-loading">Loading catalog...</p>;

  return (
    <div>
      <h1 className="dash-page-title">Catalog</h1>
      <p className="dash-page-subtitle">Maintain supported companies and device models.</p>
      {error && <p className="dash-error">{error}</p>}
      {message && <p className="dash-success">{message}</p>}

      <div className="dash-admin-grid">
        <form className="dash-form dash-detail-card" onSubmit={handleCompanySubmit}>
          <h2 className="dash-detail-card__title">Add Company</h2>
          <div className="dash-form-group">
            <label className="dash-form-label">Company Name</label>
            <input className="dash-form-input" value={companyForm.name} onChange={(e) => setCompanyForm({ ...companyForm, name: e.target.value })} required />
          </div>
          <div className="dash-form-group">
            <label className="dash-form-label">Category</label>
            <select className="dash-form-select" value={companyForm.categoryId} onChange={(e) => setCompanyForm({ ...companyForm, categoryId: e.target.value })} required>
              <option value="">Select category</option>
              {catalog.categories?.map((category) => (
                <option key={category._id} value={category._id}>{category.name}</option>
              ))}
            </select>
          </div>
          <button type="submit" className="dash-btn dash-btn--primary" disabled={saving}>
            Add Company
          </button>
        </form>

        <form className="dash-form dash-detail-card" onSubmit={handleModelSubmit}>
          <h2 className="dash-detail-card__title">Add Device Model</h2>
          <div className="dash-form-group">
            <label className="dash-form-label">Model Name</label>
            <input className="dash-form-input" value={modelForm.name} onChange={(e) => setModelForm({ ...modelForm, name: e.target.value })} required />
          </div>
          <div className="dash-form-group">
            <label className="dash-form-label">Image URL</label>
            <input className="dash-form-input" value={modelForm.img} onChange={(e) => setModelForm({ ...modelForm, img: e.target.value })} />
          </div>
          <div className="dash-form-group">
            <label className="dash-form-label">Category</label>
            <select className="dash-form-select" value={modelForm.categoryId} onChange={(e) => setModelForm({ ...modelForm, categoryId: e.target.value })} required>
              <option value="">Select category</option>
              {catalog.categories?.map((category) => (
                <option key={category._id} value={category._id}>{category.name}</option>
              ))}
            </select>
          </div>
          <div className="dash-form-group">
            <label className="dash-form-label">Company</label>
            <select className="dash-form-select" value={modelForm.companyId} onChange={(e) => setModelForm({ ...modelForm, companyId: e.target.value })} required>
              <option value="">Select company</option>
              {catalog.companies?.map((company) => (
                <option key={company._id} value={company._id}>{company.name}</option>
              ))}
            </select>
          </div>
          <button type="submit" className="dash-btn dash-btn--primary" disabled={saving}>
            Add Model
          </button>
        </form>
      </div>

      <div className="dash-detail-card">
        <h2 className="dash-detail-card__title">Companies</h2>
        {catalog.companies?.map((company) => (
          <div key={company._id} className="dash-detail-row">
            <span>{company.name}</span>
            <span>{company.categories?.map((category) => category.name).join(", ")}</span>
          </div>
        ))}
      </div>

      <div className="dash-detail-card">
        <h2 className="dash-detail-card__title">Device Models</h2>
        {catalog.models?.map((model) => (
          <div key={model._id} className="dash-detail-row">
            <span>{model.name}</span>
            <span>{model.company?.name || "-"} / {model.category?.name || "-"}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
