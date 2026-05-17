"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { PageHeader } from "@/app/components/PageHeader";
import { StatusBadge, formatCurrency, formatDate, Skeleton } from "@/app/components/ui";

type InvoiceLineItem = { id: string; description: string; quantity: number; rate: number; gstRate: number; amount: number; taxAmount: number };
type Invoice = { id: string; number: string; customerId: string; issueDate: string; dueDate: string; status: string; currency: string; lineItems: InvoiceLineItem[]; subtotal: number; taxTotal: number; total: number; amountPaid: number; paymentLinkUrl?: string; notes?: string; createdAt: string };
type Customer = { id: string; name: string; email?: string; phone?: string };
type Payment = { id: string; amount: number; currency: string; method: string; reference?: string; paidAt: string };

export default function InvoiceDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [payForm, setPayForm] = useState({ amount: "", method: "upi", reference: "" });
  const [payError, setPayError] = useState("");
  const [updating, setUpdating] = useState(false);
  const [linkLoading, setLinkLoading] = useState(false);
  const [linkError, setLinkError] = useState("");

  async function load() {
    const [invRes, payRes, cusRes] = await Promise.all([
      fetch(`/api/invoices/${id}`, { credentials: "include" }),
      fetch("/api/payments", { credentials: "include" }),
      fetch("/api/customers", { credentials: "include" }),
    ]);
    if (!invRes.ok) { router.push("/invoices"); return; }
    const invData = await invRes.json();
    const payData = await payRes.json();
    const cusData = await cusRes.json();
    const inv: Invoice = invData.invoice;
    setInvoice(inv);
    const allPayments: Payment[] = payData.payments ?? [];
    setPayments(allPayments.filter((p) => (p as unknown as { invoiceId: string }).invoiceId === id));
    const cus = (cusData.customers ?? []).find((c: Customer) => c.id === inv.customerId);
    setCustomer(cus ?? null);
    setLoading(false);
  }

  useEffect(() => { load(); }, [id]); // eslint-disable-line

  async function handleStatusChange(status: string) {
    setUpdating(true);
    await fetch(`/api/invoices/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify({ status }) });
    load();
    setUpdating(false);
  }

  async function handlePayment(e: React.FormEvent) {
    e.preventDefault();
    setPayError("");
    const amount = parseFloat(payForm.amount);
    if (!amount || amount <= 0) { setPayError("Enter a valid amount."); return; }
    setPaying(true);
    try {
      const res = await fetch("/api/payments", { method: "POST", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify({ invoiceId: id, amount, method: payForm.method, reference: payForm.reference || undefined }) });
      const data = await res.json();
      if (!res.ok) setPayError(data.error ?? "Payment failed");
      else { setPayForm({ amount: "", method: "upi", reference: "" }); load(); }
    } catch { setPayError("Network error."); }
    finally { setPaying(false); }
  }

  async function createPaymentLink() {
    setLinkLoading(true); setLinkError("");
    try {
      const res = await fetch(`/api/invoices/${id}/payment-link`, { method: "POST", credentials: "include" });
      const data = await res.json();
      if (!res.ok) setLinkError(data.error ?? "Failed");
      else if (invoice) setInvoice({ ...invoice, paymentLinkUrl: data.paymentLinkUrl });
    } catch { setLinkError("Failed to create payment link"); }
    finally { setLinkLoading(false); }
  }

  if (loading) {
    return <div className="max-w-4xl"><PageHeader title="Loading..." /><Skeleton className="h-96" /></div>;
  }
  if (!invoice) return null;

  const outstanding = invoice.total - invoice.amountPaid;
  const methodIcons: Record<string, string> = { upi: "📱", bank_transfer: "🏦", cash: "💵", card: "💳", other: "🔄" };

  return (
    <div className="max-w-4xl">
      <PageHeader title={invoice.number} subtitle={`Issued ${formatDate(invoice.issueDate)}`}>
        <StatusBadge status={invoice.status} />
        <Link href="/invoices" className="btn-secondary">← Back</Link>
      </PageHeader>

      <div className="card mb-6 animate-fade-in">
        <div className="flex flex-col sm:flex-row justify-between gap-6 mb-6">
          <div>
            <p className="section-title mb-2">Customer</p>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 flex items-center justify-center text-sm font-bold text-indigo-400">
                {customer?.name?.charAt(0) ?? "?"}
              </div>
              <div>
                <p className="font-semibold text-white">{customer?.name ?? "\u2014"}</p>
                {customer?.email && <p className="text-xs text-slate-500">{customer.email}</p>}
              </div>
            </div>
          </div>
          <div className="text-right">
            <p className="section-title mb-2">Issue / Due</p>
            <p className="text-sm text-white font-medium">{formatDate(invoice.issueDate)}</p>
            <p className="text-sm text-white">{formatDate(invoice.dueDate)}</p>
          </div>
        </div>

        <table className="w-full text-sm">
          <thead>
            <tr className="text-slate-500 border-b border-slate-800/50">
              <th className="text-left pb-3 font-semibold text-xs uppercase tracking-wider">Description</th>
              <th className="text-right pb-3 font-semibold text-xs uppercase tracking-wider">Qty</th>
              <th className="text-right pb-3 font-semibold text-xs uppercase tracking-wider">Rate</th>
              <th className="text-right pb-3 font-semibold text-xs uppercase tracking-wider">GST</th>
              <th className="text-right pb-3 font-semibold text-xs uppercase tracking-wider">Amount</th>
            </tr>
          </thead>
          <tbody>
            {invoice.lineItems.map((li) => (
              <tr key={li.id} className="border-b border-slate-800/30">
                <td className="py-3 text-slate-200 font-medium">{li.description}</td>
                <td className="py-3 text-right text-slate-400">{li.quantity}</td>
                <td className="py-3 text-right text-slate-400">{formatCurrency(li.rate, invoice.currency)}</td>
                <td className="py-3 text-right text-slate-400">{li.gstRate}%</td>
                <td className="py-3 text-right text-white font-semibold">{formatCurrency(li.amount + li.taxAmount, invoice.currency)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="space-y-1.5 text-sm border-t border-slate-800/50 pt-4 mt-4">
          <div className="flex justify-between text-slate-400"><span>Subtotal</span><span>{formatCurrency(invoice.subtotal, invoice.currency)}</span></div>
          <div className="flex justify-between text-slate-400"><span>Tax (GST)</span><span>{formatCurrency(invoice.taxTotal, invoice.currency)}</span></div>
          <div className="flex justify-between text-white font-bold text-base border-t border-slate-700/50 pt-3 mt-3"><span>Total</span><span className="text-indigo-400">{formatCurrency(invoice.total, invoice.currency)}</span></div>
          {invoice.amountPaid > 0 && (
            <>
              <div className="flex justify-between text-emerald-400"><span>Paid</span><span>{formatCurrency(invoice.amountPaid, invoice.currency)}</span></div>
              <div className="flex justify-between text-white font-semibold"><span>Outstanding</span><span>{formatCurrency(outstanding, invoice.currency)}</span></div>
            </>
          )}
        </div>

        {invoice.notes && (
          <div className="mt-5 pt-4 border-t border-slate-800/50">
            <p className="section-title mb-2">Notes</p>
            <p className="text-sm text-slate-300 bg-slate-800/40 rounded-xl p-4">{invoice.notes}</p>
          </div>
        )}
      </div>

      {invoice.status !== "paid" && (
        <div className="flex gap-2 mb-6 flex-wrap animate-fade-in-delay-1">
          {invoice.status === "draft" && <button onClick={() => handleStatusChange("sent")} className="btn-primary" disabled={updating}>Mark as Sent</button>}
          {(invoice.status === "sent" || invoice.status === "overdue") && <button onClick={() => handleStatusChange("paid")} className="btn-success" disabled={updating}>Mark as Paid</button>}
          {invoice.status !== "draft" && <button onClick={() => handleStatusChange("draft")} className="btn-secondary" disabled={updating}>Revert to Draft</button>}
          <button onClick={createPaymentLink} className="btn-outline" disabled={linkLoading}>{linkLoading ? "Creating…" : "Generate Payment Link"}</button>
        </div>
      )}
      {invoice.paymentLinkUrl && (
        <div className="card mb-6 animate-fade-in">
          <p className="section-title mb-2">Payment Link</p>
          <a href={invoice.paymentLinkUrl} target="_blank" rel="noreferrer" className="text-sm text-indigo-400 break-all hover:underline font-medium">{invoice.paymentLinkUrl}</a>
        </div>
      )}
      {linkError && <div className="bg-rose-500/10 border border-rose-500/20 rounded-2xl px-5 py-3 mb-6"><p className="text-sm text-rose-400">{linkError}</p></div>}

      {invoice.status !== "paid" && outstanding > 0 && (
        <div className="card mb-6 animate-fade-in-delay-2">
          <h2 className="section-title">Record Payment</h2>
          <form onSubmit={handlePayment} className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div>
              <label className="label">Amount</label>
              <input className="input" type="number" min="0.01" step="0.01" placeholder={outstanding.toFixed(2)} value={payForm.amount} onChange={(e) => setPayForm((f) => ({ ...f, amount: e.target.value }))} />
            </div>
            <div>
              <label className="label">Method</label>
              <select className="input" value={payForm.method} onChange={(e) => setPayForm((f) => ({ ...f, method: e.target.value }))}>
                <option value="upi">UPI</option>
                <option value="bank_transfer">Bank Transfer</option>
                <option value="cash">Cash</option>
                <option value="card">Card</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label className="label">Reference</label>
              <input className="input" type="text" placeholder="UTR / Ref" value={payForm.reference} onChange={(e) => setPayForm((f) => ({ ...f, reference: e.target.value }))} />
            </div>
            <div className="flex items-end">
              <button type="submit" className="btn-primary w-full" disabled={paying}>{paying ? "Recording…" : "Record Payment"}</button>
            </div>
          </form>
          {payError && <p className="text-sm text-rose-400 mt-3 bg-rose-500/10 rounded-xl px-4 py-2">{payError}</p>}
        </div>
      )}

      {payments.length > 0 && (
        <div className="card animate-fade-in-delay-3">
          <h2 className="section-title">Payment History</h2>
          <div className="space-y-1">
            {payments.map((p) => (
              <div key={p.id} className="flex items-center justify-between py-3 border-b border-slate-800/30 last:border-0">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-emerald-500/10 flex items-center justify-center text-sm">{methodIcons[p.method] ?? "💳"}</div>
                  <div>
                    <p className="text-sm font-semibold text-white">{formatCurrency(p.amount, p.currency)}</p>
                    <p className="text-xs text-slate-500">{p.method}{p.reference ? ` · ${p.reference}` : ""}</p>
                  </div>
                </div>
                <p className="text-xs text-slate-400">{formatDate(p.paidAt)}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
