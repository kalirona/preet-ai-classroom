import React, { useState } from "react";
import { CheckCircle, Percent, CreditCard, DollarSign, Calendar, Wallet, TrendingUp } from "lucide-react";

const STORAGE_KEY = "platform_billing";

type PaymentGateway = "stripe" | "paypal";
type PayoutSchedule = "weekly" | "monthly";

export default function BillingRevenue() {
  const loadSaved = () => {
    try { const s = localStorage.getItem(STORAGE_KEY); return s ? JSON.parse(s) : {}; }
    catch { return {}; }
  };
  const initial = loadSaved();
  const [commission, setCommission] = useState(initial.commission ?? 10);
  const [gateway, setGateway] = useState<PaymentGateway>(initial.gateway || "stripe");
  const [stripeKey, setStripeKey] = useState(initial.stripeKey || "");
  const [paypalEmail, setPaypalEmail] = useState(initial.paypalEmail || "");
  const [payoutSchedule, setPayoutSchedule] = useState<PayoutSchedule>(initial.payoutSchedule || "monthly");
  const [saved, setSaved] = useState(false);

  function handleSave() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ commission, gateway, stripeKey, paypalEmail, payoutSchedule }));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  const COMMISSION_OPTIONS = [5, 10, 15];

  return (
    <div className="space-y-5">
      {/* Commission */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-4">
        <h3 className="text-lg font-semibold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
          <Percent className="w-4 h-4 text-indigo-500" />
          Platform Commission
        </h3>
        <p className="text-xs text-slate-400">Percentage taken from each creator's subscription revenue.</p>
        <div className="flex gap-3">
          {COMMISSION_OPTIONS.map((val) => (
            <button
              key={val}
              onClick={() => setCommission(val)}
              className={`px-6 py-3 rounded-xl text-sm font-bold transition ${
                commission === val
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "bg-slate-100 text-slate-500 hover:bg-slate-200"
              }`}
            >
              {val}%
            </button>
          ))}
        </div>
      </div>

      {/* Revenue Overview */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-4">
        <h3 className="text-lg font-semibold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-emerald-500" />
          Revenue Overview
        </h3>
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-slate-50 rounded-xl p-4 space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase font-mono">Total Revenue</span>
            <p className="text-xl font-bold text-slate-900">$0.00</p>
          </div>
          <div className="bg-slate-50 rounded-xl p-4 space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase font-mono">Platform Revenue</span>
            <p className="text-xl font-bold text-indigo-600">$0.00</p>
          </div>
          <div className="bg-slate-50 rounded-xl p-4 space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase font-mono">Creator Revenue</span>
            <p className="text-xl font-bold text-emerald-600">$0.00</p>
          </div>
        </div>
      </div>

      {/* Payment Gateway */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-4">
        <h3 className="text-lg font-semibold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
          <CreditCard className="w-4 h-4 text-slate-500" />
          Payment Gateway
        </h3>
        <div className="flex gap-3">
          {(["stripe", "paypal"] as PaymentGateway[]).map((g) => (
            <button
              key={g}
              onClick={() => setGateway(g)}
              className={`px-4 py-2 rounded-xl text-xs font-bold capitalize transition ${
                gateway === g ? "bg-indigo-600 text-white shadow-sm" : "bg-slate-100 text-slate-500 hover:bg-slate-200"
              }`}
            >
              {g}
            </button>
          ))}
        </div>
        {gateway === "stripe" ? (
          <div className="space-y-1">
            <label className="text-[9px] font-bold text-slate-400 block uppercase font-mono">Stripe Secret Key</label>
            <input type="password" value={stripeKey} onChange={(e) => setStripeKey(e.target.value)}
              placeholder="sk_live_..." className="w-full max-w-md bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs font-mono text-slate-700 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition" />
          </div>
        ) : (
          <div className="space-y-1">
            <label className="text-[9px] font-bold text-slate-400 block uppercase font-mono">PayPal Business Email</label>
            <input type="email" value={paypalEmail} onChange={(e) => setPaypalEmail(e.target.value)}
              placeholder="merchant@example.com" className="w-full max-w-md bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs font-mono text-slate-700 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition" />
          </div>
        )}
      </div>

      {/* Payout Rules */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-4">
        <h3 className="text-lg font-semibold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
          <Calendar className="w-4 h-4 text-slate-500" />
          Payout Schedule
        </h3>
        <div className="flex gap-3">
          {(["weekly", "monthly"] as PayoutSchedule[]).map((s) => (
            <button
              key={s}
              onClick={() => setPayoutSchedule(s)}
              className={`px-4 py-2 rounded-xl text-xs font-bold capitalize transition ${
                payoutSchedule === s ? "bg-indigo-600 text-white shadow-sm" : "bg-slate-100 text-slate-500 hover:bg-slate-200"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <button onClick={handleSave}
        className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs shadow-sm transition flex items-center gap-1.5">
        <Wallet className="w-3.5 h-3.5" />
        {saved ? "Saved!" : "Save Billing Settings"}
      </button>
    </div>
  );
}
