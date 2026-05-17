"use client";
import { useEffect, useState } from "react";
import { useAuth } from "@/app/components/AuthProvider";
import { PageHeader } from "@/app/components/PageHeader";
import { triggerRefresh } from "@/lib/useData";

type Business = {
  id: string;
  name: string;
  gstin?: string;
  address?: string;
  country: string;
  timezone: string;
};

export default function SettingsPage() {
  const { user, refresh } = useAuth();
  const [business, setBusiness] = useState<Business | null>(null);
  const [form, setForm] = useState({
    name: "", gstin: "", address: "", country: "IN", timezone: "Asia/Kolkata", whatsappNumber: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([fetch("/api/business", { credentials: "include" }), fetch("/api/auth/me", { credentials: "include" })])
      .then(async ([bizRes, meRes]) => {
        const bizData = await bizRes.json();
        const meData = await meRes.json();
        if (!bizRes.ok) throw new Error(bizData.error ?? "Failed to load");
        if (!meRes.ok) throw new Error(meData.error ?? "Failed to load");
        const b: Business = bizData.business;
        setBusiness(b);
        setForm({ name: b.name, gstin: b.gstin ?? "", address: b.address ?? "", country: b.country, timezone: b.timezone, whatsappNumber: meData.user?.whatsappNumber ?? "" });
      })
      .catch((e: unknown) => setError(e instanceof Error ? e.message : "Failed to load"))
      .finally(() => setLoading(false));
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(""); setSuccess(false); setSaving(true);
    try {
      const res = await fetch("/api/business", { method: "PATCH", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify({ name: form.name, gstin: form.gstin, address: form.address, country: form.country, timezone: form.timezone }) });
      const businessData = await res.json();
      if (!res.ok) { setError(businessData.error ?? "Failed to save"); return; }
      const profileRes = await fetch("/api/auth/me", { method: "PATCH", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify({ whatsappNumber: form.whatsappNumber }) });
      const profileData = await profileRes.json();
      if (!profileRes.ok) { setError(profileData.error ?? "Failed to save WhatsApp"); return; }
      setBusiness(businessData.business);
      setSuccess(true);
      await refresh();
      triggerRefresh("customers");
      setTimeout(() => setSuccess(false), 3000);
    } catch { setError("Network error."); }
    finally { setSaving(false); }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 rounded-full border-2 border-indigo-400 border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl">
      <PageHeader title="Settings" subtitle="Manage your business profile and integrations" />

      <div className="card mb-6 animate-fade-in">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 flex items-center justify-center text-lg">👤</div>
          <div>
            <h2 className="text-sm font-semibold text-white">Account</h2>
            <p className="text-xs text-slate-500">{user?.email}</p>
          </div>
        </div>
        <div className="flex items-center gap-4 text-sm text-slate-400">
          <span>Role: <span className="text-slate-200 capitalize font-medium">{user?.role}</span></span>
          <span className="text-slate-700">|</span>
          <span>Business ID: <span className="text-slate-500 font-mono text-xs">{business?.id}</span></span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 animate-fade-in-delay-1">
        <div className="card">
          <h2 className="section-title">Business Details</h2>
          <div className="space-y-4">
            <div>
              <label className="label">Business Name</label>
              <input className="input" type="text" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} required />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="label">GSTIN</label>
                <input className="input" type="text" placeholder="22AAAAA0000A1Z5" value={form.gstin} onChange={(e) => setForm((f) => ({ ...f, gstin: e.target.value }))} />
              </div>
              <div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="label">Country</label>
                    <input className="input" type="text" value={form.country} onChange={(e) => setForm((f) => ({ ...f, country: e.target.value }))} />
                  </div>
                  <div>
                    <label className="label">Timezone</label>
                    <select className="input" value={form.timezone} onChange={(e) => setForm((f) => ({ ...f, timezone: e.target.value }))}>
                      <option value="Asia/Kolkata">IST</option>
                      <option value="America/New_York">EST</option>
                      <option value="Europe/London">GMT</option>
                      <option value="Asia/Dubai">GST</option>
                      <option value="Asia/Singapore">SGT</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
            <div>
              <label className="label">Address</label>
              <textarea className="input resize-none" rows={2} placeholder="Street, City, State, PIN" value={form.address} onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))} />
            </div>
          </div>
        </div>

        <div className="card">
          <h2 className="section-title">WhatsApp Integration</h2>
          <div>
            <label className="label">WhatsApp Number</label>
            <input className="input" type="tel" placeholder="+919999999999" value={form.whatsappNumber} onChange={(e) => setForm((f) => ({ ...f, whatsappNumber: e.target.value }))} />
            <p className="text-xs text-slate-500 mt-1.5">Used to map incoming WhatsApp commands to your business.</p>
          </div>
        </div>

        {error && (
          <div className="bg-rose-500/10 border border-rose-500/20 rounded-2xl px-5 py-3">
            <p className="text-sm text-rose-400">{error}</p>
          </div>
        )}
        {success && (
          <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl px-5 py-3">
            <p className="text-sm text-emerald-400">✓ Settings saved successfully!</p>
          </div>
        )}

        <div className="flex gap-3">
          <button type="submit" className="btn-primary" disabled={saving}>
            {saving ? "Saving…" : "Save Changes"}
          </button>
        </div>
      </form>

      <div className="card mt-6 animate-fade-in-delay-3">
        <h2 className="section-title">Integrations</h2>
        <div className="space-y-4">
          <div className="flex items-start gap-4 p-4 rounded-2xl bg-slate-800/40 border border-slate-700/30">
            <span className="text-2xl">💬</span>
            <div>
              <p className="text-sm font-semibold text-white mb-1">WhatsApp Cloud API</p>
              <p className="text-xs text-slate-400 leading-relaxed">
                Set <code className="bg-slate-800 px-1.5 py-0.5 rounded text-indigo-400">WA_PHONE_NUMBER_ID</code>,{" "}
                <code className="bg-slate-800 px-1.5 py-0.5 rounded text-indigo-400">WA_ACCESS_TOKEN</code>, and{" "}
                <code className="bg-slate-800 px-1.5 py-0.5 rounded text-indigo-400">WA_WEBHOOK_VERIFY_TOKEN</code>{" "}
                in <code className="bg-slate-800 px-1.5 py-0.5 rounded text-indigo-400">.env.local</code>.
              </p>
              <p className="text-xs text-slate-500 mt-1">Webhook URL: <code className="text-indigo-400">/api/webhooks/whatsapp</code></p>
            </div>
          </div>
          <div className="flex items-start gap-4 p-4 rounded-2xl bg-slate-800/40 border border-slate-700/30">
            <span className="text-2xl">📱</span>
            <div>
              <p className="text-sm font-semibold text-white mb-1">Meta (Instagram / FB)</p>
              <p className="text-xs text-slate-400 leading-relaxed">
                Set <code className="bg-slate-800 px-1.5 py-0.5 rounded text-indigo-400">META_WEBHOOK_VERIFY_TOKEN</code>{" "}
                and point Meta webhook to{" "}
                <code className="bg-slate-800 px-1.5 py-0.5 rounded text-indigo-400">/api/webhooks/meta</code>.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-4 p-4 rounded-2xl bg-slate-800/40 border border-slate-700/30">
            <span className="text-2xl">🏦</span>
            <div>
              <p className="text-sm font-semibold text-white mb-1">Razorpay</p>
              <p className="text-xs text-slate-400 leading-relaxed">
                Set <code className="bg-slate-800 px-1.5 py-0.5 rounded text-indigo-400">RAZORPAY_WEBHOOK_SECRET</code>{" "}
                for automatic payment reconciliation via webhook.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
