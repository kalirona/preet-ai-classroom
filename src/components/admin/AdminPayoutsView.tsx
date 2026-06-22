import React, { useState, useEffect } from "react";
import { DollarSign, Clock, CheckCircle, XCircle, Search, Filter, ArrowUpRight, AlertCircle, ChevronDown, User } from "lucide-react";

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

type FilterType = "all" | "pending" | "approved" | "rejected" | "paid";

export default function AdminPayoutsView() {
  const [payouts, setPayouts] = useState<PayoutRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterType>("pending");
  const [actionId, setActionId] = useState<string | null>(null);
  const [adminNote, setAdminNote] = useState("");

  const fetchPayouts = (status?: string) => {
    const url = status && status !== "all" ? `/api/admin/payouts?status=${status}` : "/api/admin/payouts";
    fetch(url)
      .then((r) => r.json())
      .then((data) => {
        if (data.payouts) setPayouts(data.payouts);
      })
      .catch((err: unknown) => console.error("Failed to load payouts:", err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchPayouts(filter);
  }, [filter]);

  const handleAction = async (id: string, status: string) => {
    try {
      const res = await fetch(`/api/admin/payouts/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, adminNotes: adminNote }),
      });
      const data = await res.json();
      if (data.success) {
        setActionId(null);
        setAdminNote("");
        fetchPayouts(filter);
      }
    } catch (err) {
      console.error("Payout action error:", err);
    }
  };

  const filtered = filter === "all" ? payouts : payouts.filter((p) => p.status === filter);

  const counts = {
    all: payouts.length,
    pending: payouts.filter((p) => p.status === "pending").length,
    approved: payouts.filter((p) => p.status === "approved").length,
    rejected: payouts.filter((p) => p.status === "rejected").length,
    paid: payouts.filter((p) => p.status === "paid").length,
  };

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
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900">Payout Requests</h1>
        <p className="text-sm text-gray-500 mt-1">Manage creator withdrawal requests</p>
      </div>

      {/* Filter chips */}
      <div className="flex items-center gap-2 mb-6 flex-wrap">
        {(["all", "pending", "approved", "rejected", "paid"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`text-xs font-semibold px-3 py-1.5 rounded-full transition-colors ${
              filter === f
                ? "bg-gray-900 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
            <span className="ml-1.5 opacity-70">{counts[f]}</span>
          </button>
        ))}
      </div>

      {/* List */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
            <DollarSign className="w-8 h-8 text-gray-300 mx-auto mb-2" />
            <p className="text-sm text-gray-500">No payout requests found</p>
          </div>
        ) : (
          filtered.map((p) => (
            <div key={p.id} className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
              <div className="p-5">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center">
                      {statusIcon(p.status)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-sm font-semibold text-gray-900">${p.amount.toFixed(2)}</h3>
                        {statusBadge(p.status)}
                      </div>
                      <div className="flex items-center gap-3 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <User className="w-3 h-3" />
                          {p.creator_name || "Unknown"}
                        </span>
                        <span>{p.workspace_name || p.workspace_id}</span>
                        <span>{new Date(p.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
                      </div>
                      {p.notes && <p className="text-xs text-gray-500 mt-1 italic">"{p.notes}"</p>}
                      {p.admin_notes && (
                        <p className="text-xs text-gray-400 mt-1">Admin: {p.admin_notes}</p>
                      )}
                    </div>
                  </div>

                  {/* Action buttons for pending */}
                  {p.status === "pending" && (
                    <div className="shrink-0">
                      {actionId === p.id ? (
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            value={adminNote}
                            onChange={(e) => setAdminNote(e.target.value)}
                            placeholder="Note..."
                            className="w-32 px-2 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-100"
                          />
                          <button
                            onClick={() => handleAction(p.id, "approved")}
                            className="text-xs font-semibold text-emerald-600 bg-emerald-50 hover:bg-emerald-100 px-2.5 py-1.5 rounded-lg transition-colors"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleAction(p.id, "rejected")}
                            className="text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 px-2.5 py-1.5 rounded-lg transition-colors"
                          >
                            Reject
                          </button>
                          <button onClick={() => setActionId(null)} className="text-xs text-gray-400 hover:text-gray-600">
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setActionId(p.id)}
                          className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-lg transition-colors"
                        >
                          Review
                        </button>
                      )}
                    </div>
                  )}

                  {/* Mark as paid for approved */}
                  {p.status === "approved" && (
                    <button
                      onClick={() => handleAction(p.id, "paid")}
                      className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-lg transition-colors shrink-0"
                    >
                      Mark as Paid
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
