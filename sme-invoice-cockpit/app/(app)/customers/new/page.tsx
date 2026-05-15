"use client";
import { Suspense, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { PageHeader } from "@/app/components/PageHeader";
import { triggerRefresh } from "@/lib/useData";

function Form() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") ?? "/customers";

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    gstin: "",
    billingAddress: "",
    shippingAddress: "",
  });
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setFieldErrors({});
    setLoading(true);
    try {
      const res = await fetch("/api/customers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        if (data.details && typeof data.details === 'object') {
          // Handle field-specific errors
          const errors: Record<string, string> = {};
          for (const [key, value] of Object.entries(data.details)) {
            if (Array.isArray(value) && value.length > 0) {
              errors[key] = value[0];
            }
          }
          if (Object.keys(errors).length > 0) {
            setFieldErrors(errors);
            setError("Please fix the validation errors above.");
          } else {
            setError(data.error ?? "Failed to add customer");
          }
        } else {
          setError(data.error ?? "Failed to add customer");
        }
      } else {
        triggerRefresh("customers");
        router.refresh();
        await new Promise(resolve => setTimeout(resolve, 100));
        router.push(redirectTo);
      }
    } catch (error) {
      setError("Network error. Please try again.");
      console.error("Customer submission error:", error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-xl">
      <PageHeader title="Add Customer">
        <Link href="/customers" className="btn-secondary">← Back</Link>
      </PageHeader>

      <form onSubmit={handleSubmit} className="card space-y-4">
        <div>
          <label className="label">Name *</label>
          <input
            className={`input ${fieldErrors.name ? "border-red-500" : ""}`}
            type="text"
            placeholder="Vikas Steels"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            required
            autoFocus
          />
          {fieldErrors.name && <p className="text-xs text-red-400 mt-1">{fieldErrors.name}</p>}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="label">Email</label>
            <input
              className={`input ${fieldErrors.email ? "border-red-500" : ""}`}
              type="email"
              placeholder="accounts@vikas.in"
              value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
            />
            {fieldErrors.email && <p className="text-xs text-red-400 mt-1">{fieldErrors.email}</p>}
          </div>
          <div>
            <label className="label">Phone</label>
            <input
              className={`input ${fieldErrors.phone ? "border-red-500" : ""}`}
              type="tel"
              placeholder="+911234567890"
              value={form.phone}
              onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
            />
            {fieldErrors.phone && <p className="text-xs text-red-400 mt-1">{fieldErrors.phone}</p>}
          </div>
        </div>
        <div>
          <label className="label">GSTIN</label>
          <input
            className={`input ${fieldErrors.gstin ? "border-red-500" : ""}`}
            type="text"
            placeholder="06BBBBB0000B1Z2"
            value={form.gstin}
            onChange={(e) => setForm((f) => ({ ...f, gstin: e.target.value }))}
          />
          {fieldErrors.gstin && <p className="text-xs text-red-400 mt-1">{fieldErrors.gstin}</p>}
        </div>
        <div>
          <label className="label">Billing Address</label>
          <textarea
            className="input resize-none"
            rows={2}
            placeholder="Street, City, State, PIN"
            value={form.billingAddress}
            onChange={(e) =>
              setForm((f) => ({ ...f, billingAddress: e.target.value }))
            }
          />
        </div>
        <div>
          <label className="label">Shipping Address (if different)</label>
          <textarea
            className="input resize-none"
            rows={2}
            placeholder="Same as billing if empty"
            value={form.shippingAddress}
            onChange={(e) =>
              setForm((f) => ({ ...f, shippingAddress: e.target.value }))
            }
          />
        </div>

        {error && (
          <p className="text-sm text-red-400 bg-red-900/20 border border-red-800 rounded-lg px-3 py-2">
            {error}
          </p>
        )}

        <div className="flex gap-3 pt-2">
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? "Saving…" : "Add Customer"}
          </button>
          <Link href="/customers" className="btn-secondary">Cancel</Link>
        </div>
      </form>
    </div>
  );
}

export default function NewCustomerPage() {
  return (
    <Suspense fallback={<div className="flex justify-center py-20"><div className="animate-spin h-6 w-6 rounded-full border-2 border-indigo-500 border-t-transparent" /></div>}>
      <Form />
    </Suspense>
  );
}
