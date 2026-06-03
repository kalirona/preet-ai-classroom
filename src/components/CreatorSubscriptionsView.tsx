import React, { useState } from "react";
import { User, Community } from "../types";
import { 
  Users, Repeat, Search, Filter, ShieldAlert, Sparkles, 
  CheckCircle, RefreshCw, Trash2, StopCircle, ArrowUpRight
} from "lucide-react";

interface CreatorSubscriptionsViewProps {
  currentUser: User | null;
  activeCommunity: Community | null;
}

export default function CreatorSubscriptionsView({
  currentUser,
  activeCommunity
}: CreatorSubscriptionsViewProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [newSubName, setNewSubName] = useState("");
  const [newSubEmail, setNewSubEmail] = useState("");
  const [newSubTier, setNewSubTier] = useState("Premium Cohort Seat");
  const [showAddForm, setShowAddForm] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  // Initial subscribers mock list supporting modifications
  const [subscribers, setSubscribers] = useState([
    { id: "sub-1", name: "Alice Smith", email: "alice@lucid.io", tier: "Premium Cohort Seat", amount: 49, status: "ACTIVE", nextBilling: "2026-06-25" },
    { id: "sub-2", name: "David Miller", email: "david.m@apex.net", tier: "Ultimate Lifetime Masterclass", amount: 999, status: "LIFETIME", nextBilling: "N/A" },
    { id: "sub-3", name: "Grace Hopper", email: "grace.cobol@navy.mil", tier: "Premium Cohort Seat", amount: 49, status: "ACTIVE", nextBilling: "2026-06-18" },
    { id: "sub-4", name: "Simba King", email: "simba@priderock.co", tier: "Premium Cohort Seat", amount: 49, status: "PAST_DUE", nextBilling: "2026-05-30" },
    { id: "sub-5", name: "Tony Stark", email: "tony@stark.industries", tier: "Premium Cohort Seat", amount: 0, status: "TRIAL", nextBilling: "2026-06-03" },
  ]);

  const handleSimulateNewSubscription = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubName || !newSubEmail) return;

    const newSub = {
      id: `sub-${Math.random().toString(36).substring(2, 6)}`,
      name: newSubName,
      email: newSubEmail,
      tier: newSubTier,
      amount: newSubTier.includes("Lifetime") ? 999 : 49,
      status: "ACTIVE",
      nextBilling: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]
    };

    setSubscribers([newSub, ...subscribers]);
    setNewSubName("");
    setNewSubEmail("");
    setShowAddForm(false);
    setToast(`🎉 Subscriber "${newSub.name}" added to list & recurring subscription established!`);
    setTimeout(() => setToast(null), 4000);
  };

  const handleToggleSubStatus = (id: string, currentStatus: string) => {
    let nextStatus = "ACTIVE";
    if (currentStatus === "ACTIVE") nextStatus = "CANCELLED";
    else if (currentStatus === "CANCELLED") nextStatus = "ACTIVE";
    else return; // Don't alter other states in demo

    setSubscribers(prev => prev.map(s => s.id === id ? { ...s, status: nextStatus, nextBilling: nextStatus === "CANCELLED" ? "Ends 2026-06-15" : "2026-06-25" } : s));
    setToast(`⚡ Subscription status updated successfully to ${nextStatus}!`);
    setTimeout(() => setToast(null), 3000);
  };

  // Stats calculation
  const activeCount = subscribers.filter(s => s.status === "ACTIVE" || s.status === "LIFETIME").length;
  const trialCount = subscribers.filter(s => s.status === "TRIAL").length;
  const mrrTotal = subscribers.filter(s => s.status === "ACTIVE").reduce((sum, s) => sum + s.amount, 0);
  const activeChurn = "2.4%";

  const filteredSubs = subscribers.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.tier.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-4 sm:p-6 space-y-6 overflow-y-auto h-full bg-[#F8F9FB]" id="ws-creator-subs-view">
      
      {/* HEADER ROW */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold font-display text-gray-900 tracking-tight flex items-center gap-2">
            <Repeat className="w-5 h-5 text-indigo-650" />
            Subscriptions Manager
          </h1>
          <p className="text-xs text-gray-450 mt-0.5">Control billing schedules, view trial cohorts, and edit recurring student membership status.</p>
        </div>

        <button 
          onClick={() => setShowAddForm(!showAddForm)}
          className="px-4 py-2 bg-slate-900 hover:bg-black text-white text-xs font-bold rounded-xl transition cursor-pointer flex items-center gap-1.5 shadow-sm self-start sm:self-center"
        >
          <Sparkles className="w-4 h-4 text-indigo-300" />
          Add Subscriber Seat
        </button>
      </div>

      {toast && (
        <div className="bg-indigo-50 border border-indigo-200 text-indigo-850 p-4 rounded-2xl text-xs font-semibold flex items-center gap-2 shadow-sm animate-in zoom-in-95 duration-150">
          <CheckCircle className="w-4 h-4 text-indigo-650 shrink-0" />
          <span>{toast}</span>
        </div>
      )}

      {/* ADD SUBSCRIBER FORM */}
      {showAddForm && (
        <div className="bg-white border border-gray-200 rounded-3xl p-5 shadow-md max-w-xl animate-in slide-in-from-top-4 duration-200">
          <div className="flex justify-between items-center border-b border-gray-100 pb-2 mb-4">
            <span className="text-xs font-bold uppercase tracking-wide text-gray-800 font-mono">
              Simulate Subscriber Onboarding
            </span>
            <button onClick={() => setShowAddForm(false)} className="text-xs text-gray-400 hover:text-gray-600 font-bold">Cancel</button>
          </div>

          <form onSubmit={handleSimulateNewSubscription} className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] uppercase font-mono font-bold text-gray-400 mb-1">Subscriber Full Name</label>
                <input 
                  type="text" 
                  value={newSubName} 
                  onChange={(e) => setNewSubName(e.target.value)} 
                  placeholder="e.g. Tony Hawk"
                  className="w-full border border-gray-200 rounded-xl p-2.5 text-xs bg-gray-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-600"
                  required 
                />
              </div>
              <div>
                <label className="block text-[10px] uppercase font-mono font-bold text-gray-400 mb-1">Billing Email Account</label>
                <input 
                  type="email" 
                  value={newSubEmail} 
                  onChange={(e) => setNewSubEmail(e.target.value)} 
                  placeholder="hawk@skate.org"
                  className="w-full border border-gray-200 rounded-xl p-2.5 text-xs bg-gray-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-600"
                  required 
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] uppercase font-mono font-bold text-gray-400 mb-1">Subscription Billing Tier</label>
              <select 
                value={newSubTier} 
                onChange={(e) => setNewSubTier(e.target.value)}
                className="w-full border border-gray-200 rounded-xl p-2.5 text-xs bg-gray-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-600"
              >
                <option value="Premium Cohort Seat">Premium Cohort Seat ($49/mo)</option>
                <option value="Ultimate Lifetime Masterclass">Ultimate Lifetime Masterclass ($999/one-time)</option>
              </select>
            </div>

            <button 
              type="submit" 
              className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
            >
              Add Active Member Core DB Rows
            </button>
          </form>
        </div>
      )}

      {/* SUBSMETRICS ROW */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        
        <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm">
          <span className="block text-[9px] uppercase font-mono tracking-widest text-slate-400 font-extrabold">Active Paid Members</span>
          <div className="text-lg sm:text-2xl font-black text-slate-900 mt-1 font-display">
            {activeCount} students
          </div>
          <span className="text-[10px] text-gray-400 font-mono mt-0.5 block">Access cleared</span>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm">
          <span className="block text-[9px] uppercase font-mono tracking-widest text-slate-400 font-extrabold">Subscriber MRR Flow</span>
          <div className="text-lg sm:text-2xl font-black text-indigo-700 mt-1 font-display">
            ${mrrTotal} / mo
          </div>
          <span className="text-[10px] text-gray-400 font-mono mt-0.5 block">Monthly Recurring Payouts</span>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm">
          <span className="block text-[9px] uppercase font-mono tracking-widest text-slate-350 font-extrabold bg-[#1E293B] text-white px-2 py-0.5 rounded w-max">Active Trial Users</span>
          <div className="text-lg sm:text-2xl font-black text-indigo-500 mt-1 font-display">
            {trialCount} students
          </div>
          <span className="text-[10px] text-gray-400 font-mono mt-0.5 block">Converting at ~34.8%</span>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm">
          <span className="block text-[9px] uppercase font-mono tracking-widest text-slate-400 font-extrabold">SaaS Seat Churn Rate</span>
          <div className="text-lg sm:text-2xl font-black text-teal-600 mt-1 font-display">
            {activeChurn} / mo
          </div>
          <span className="text-[10px] text-gray-400 font-mono mt-0.5 block">Industry leading benchmark</span>
        </div>

      </div>

      {/* SUBSCRIBERS DIRECTORY */}
      <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden">
        
        {/* Actions header bar */}
        <div className="p-4 border-b border-gray-150 bg-gray-50/50 flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="relative w-full sm:max-w-xs">
            <span className="absolute left-3 top-2.5 text-gray-400">
              <Search className="w-4 h-4" />
            </span>
            <input 
              type="text" 
              value={searchTerm} 
              onChange={(e) => setSearchTerm(e.target.value)} 
              placeholder="Filter active memberships..." 
              className="w-full pl-9 pr-4 py-1.5 bg-white border border-gray-200 rounded-xl text-xs focus:ring-1 focus:ring-indigo-650 focus:outline-none placeholder:text-gray-400 text-gray-700"
            />
          </div>
          <div className="text-xs text-gray-500 font-bold flex items-center gap-1">
            <span>Security Rule: Only Workspace creators can modify subscriber schedules in settings.</span>
          </div>
        </div>

        {/* Directory elements table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 text-gray-400 uppercase font-mono border-b border-gray-150 text-[10px] tracking-wider font-extrabold">
                <th className="py-3 px-4">Student Profile</th>
                <th className="py-3 px-4">Billing Plan Tier</th>
                <th className="py-3 px-4">Recur Monthly</th>
                <th className="py-3 px-4 text-center">Next Billing Date</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Actions Simulator</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 font-medium">
              {filteredSubs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-gray-400 font-sans font-medium text-xs">
                    No active subscribers exist matching search queries.
                  </td>
                </tr>
              ) : (
                filteredSubs.map((sub) => (
                  <tr key={sub.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center font-bold text-xs uppercase text-slate-800">
                          {sub.name.substring(0, 2)}
                        </div>
                        <div>
                          <span className="font-bold text-slate-800 block text-xs">{sub.name}</span>
                          <span className="text-gray-400 text-[10.5px] font-mono leading-none">{sub.email}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-slate-700 font-semibold font-sans">
                      {sub.tier}
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-gray-800 text-left">
                      ${sub.amount.toFixed(2)}
                    </td>
                    <td className="py-3 px-4 text-center font-mono opacity-80">
                      {sub.nextBilling}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className={`inline-flex items-center gap-1 rounded px-2 py-0.5 text-[9.5px] uppercase font-mono font-black ${
                        sub.status === "ACTIVE" || sub.status === "LIFETIME"
                          ? "bg-emerald-50 text-emerald-850"
                          : sub.status === "TRIAL"
                          ? "bg-blue-50 text-blue-800"
                          : sub.status === "CANCELLED"
                          ? "bg-gray-100 text-gray-500"
                          : "bg-rose-50 text-rose-800"
                      }`}>
                        {sub.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      {sub.status === "ACTIVE" || sub.status === "CANCELLED" ? (
                        <button
                          onClick={() => handleToggleSubStatus(sub.id, sub.status)}
                          className={`text-[10px] font-mono font-bold hover:underline cursor-pointer ${
                            sub.status === "ACTIVE" ? "text-rose-600" : "text-emerald-600"
                          }`}
                        >
                          {sub.status === "ACTIVE" ? "Simulate Cancel" : "Simulate Restart"}
                        </button>
                      ) : (
                        <span className="text-[10px] text-gray-400 font-mono italic">Protected plan</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

      </div>

    </div>
  );
}
