import React, { useState, useEffect } from "react";
import { DollarSign, Wallet, Clock, CheckCircle, XCircle, Send, Plus, ArrowUpRight, AlertCircle } from "lucide-react";

interface PayoutRequest {
  id: string;
  creator_user_id: string;
  creator_name: string;
  workspace_id: string;
  workspace_name: string;
  amount: number;
  status: string;
  notes: string;
  admin_notes: string | null;
  created_at: string;
  updated_at: string;
  processed_at: string | null;
  processed_by: string | null;
}

interface CreatorPayoutsViewProps {
  workspaceId: string;
  workspaceName?: string;
}

export default function CreatorPayoutsView({ workspaceId, workspaceName }: CreatorPayoutsViewProps) {
  const [payouts, setPayouts] = useState<PayoutRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [amount, setAmount] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const fetchPayouts = () => {
    if (!workspaceId) return;
    fetch(`/api/payouts?workspaceId=${workspaceId}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.payouts) setPayouts(data.payouts);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchPayouts();
  }, [workspaceId]);

  const handleSubmit = async () => {
    const amt = parseFloat(amount);
    if (!amt || amt <= 0) { setError("Enter a valid amount."); return; }
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch("/api/payouts/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ workspaceId, amount: amt, notes }),
      });
      const data = await res.json();
      if (data.success) {
        setShowForm(false);
        setAmount("");
        setNotes("");
        fetchPayouts();
      } else {
        setError(data.error || "Failed to submit.");
      }
    } catch {
      setError("Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  };

  const totalEarned = payouts.filter((p) => p.status === "paid" || p.status === "approved").reduce((s, p) => s + p.amount, 0);
  const pendingTotal = payouts.filter((p) => p.status === "pending").reduce((s, p) => s + p.amount, 0);

  const statusIcon = (status: string) => {
    switch (status) {
      case "pending": return <Clock className="w-4 h-4 text-amber-500" />;
      case "approved": return <CheckCircle className="w-4 h-4 text-emerald-500" />;
      case "rejected": return <XCircle className="w-4 h-4 text-red-500" />;
      case "paid": return <DollarSign className="w-4 h-4 text-indigo-500" />;
      default: return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  const statusBadge = (status: string) => {
    const styles: Record<string, string> = {
      pending: "bg-amber-100 text-amber-700",
      approved: "bg-emerald-100 text-emerald-700",
      rejected: "bg-red-100 text-red-700",
      paid: "bg-indigo-100 text-indigo-700",
    };
    return (
      <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${styles[status] || "bg-gray-100 text-gray-600"}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Payouts</h1>
          <p className="text-sm text-gray-500 mt-1">Manage your earnings and withdrawal requests</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors"
        >
          <Plus className="w-4 h-4" />
          Request Withdrawal
        </button>
      </div>

      {/* Stats */}
      <div className="grid sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-2xl border border-gray-200 p-5">
          <div className="w-9 h-9 rounded-xl bg-emerald-100 flex items-center justify-center mb-3">
            <DollarSign className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-xs text-gray-500 mb-1">Total Paid</p>
          <p className="text-xl font-bold text-gray-900">${totalEarned.toFixed(2)}</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-200 p-5">
          <div className="w-9 h-9 rounded-xl bg-amber-100 flex items-center justify-center mb-3">
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <p className="text-xs text-gray-500 mb-1">Pending</p>
          <p className="text-xl font-bold text-gray-900">${pendingTotal.toFixed(2)}</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-200 p-5">
          <div className="w-9 h-9 rounded-xl bg-indigo-100 flex items-center justify-center mb-3">
            <Send className="w-4 h-4 text-indigo-600" />
          </div>
          <p className="text-xs text-gray-500 mb-1">Total Requests</p>
          <p className="text-xl font-bold text-gray-900">{payouts.length}</p>
        </div>
      </div>

      {/* New withdrawal form */}
      {showForm && (
        <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-6">
          <h3 className="text-sm font-semibold text-gray-900 mb-4">New Withdrawal Request</h3>
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-2.5 mb-4">
              <p className="text-xs text-red-700">{error}</p>
            </div>
          )}
          <div className="grid sm:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">Amount ($)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-300"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">Notes (optional)</label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Any notes for admin"
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-300"
              />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors"
            >
              {submitting ? (
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
              Submit Request
            </button>
            <button onClick={() => setShowForm(false)} className="text-sm text-gray-500 hover:text-gray-700 px-3 py-2">
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Payout history */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100">
          <h3 className="text-sm font-semibold text-gray-900">Withdrawal History</h3>
        </div>
        {payouts.length === 0 ? (
          <div className="px-5 py-12 text-center">
            <Wallet className="w-8 h-8 text-gray-300 mx-auto mb-2" />
            <p className="text-sm text-gray-500">No withdrawal requests yet</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {payouts.map((p) => (
              <div key={p.id} className="px-5 py-4 flex items-center justify-between hover:bg-gray-50/50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-gray-100 flex items-center justify-center">
                    {statusIcon(p.status)}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">${p.amount.toFixed(2)}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      {statusBadge(p.status)}
                      <span className="text-xs text-gray-400">
                        {new Date(p.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                      </span>
                    </div>
                  </div>
                </div>
                {p.admin_notes && (
                  <div className="text-xs text-gray-500 text-right max-w-[200px]">
                    <span className="text-gray-400">Admin note:</span> {p.admin_notes}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
