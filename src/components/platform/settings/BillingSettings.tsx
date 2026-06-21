import React, { useState } from "react";
import { CreditCard, Percent, DollarSign } from "lucide-react";

type PaymentGateway = "stripe" | "paypal";

export default function BillingSettings() {
  const [commission, setCommission] = useState(3);
  const [gateway, setGateway] = useState<PaymentGateway>("stripe");
  const [stripeKey, setStripeKey] = useState("");
  const [paypalEmail, setPaypalEmail] = useState("");
  const [saved, setSaved] = useState(false);

  function handleSave() {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-6">
      <div className="flex justify-between items-center border-b border-slate-100 pb-3">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">Billing Settings</h3>
          <p className="text-[10px] text-slate-400 mt-0.5">Platform commission structure and payment gateway configuration.</p>
        </div>
        {saved && (
          <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-lg">Saved</span>
        )}
      </div>

      {/* Commission */}
      <div className="bg-indigo-50/50 rounded-xl border border-indigo-100 p-4 space-y-3">
        <div className="flex items-center gap-2">
          <Percent className="w-4 h-4 text-indigo-500" />
          <span className="text-sm font-bold text-slate-800">Platform Commission</span>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <input
              type="number"
              min={0}
              max={100}
              value={commission}
              onChange={(e) => setCommission(Number(e.target.value))}
              className="w-20 bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm font-bold text-slate-700 text-center focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition"
            />
            <span className="text-sm font-bold text-slate-500">%</span>
          </div>
          <span className="text-xs text-slate-400">
            Taken from each creator's subscription revenue.
          </span>
        </div>
      </div>

      {/* Payment Gateway */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
          <CreditCard className="w-4 h-4 text-slate-500" />
          <span className="text-sm font-bold text-slate-800">Payment Gateway</span>
        </div>

        <div className="flex gap-3">
          {(["stripe", "paypal"] as PaymentGateway[]).map((g) => (
            <button
              key={g}
              onClick={() => setGateway(g)}
              className={`px-4 py-2 rounded-xl text-xs font-bold capitalize transition ${
                gateway === g
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "bg-slate-100 text-slate-500 hover:bg-slate-200"
              }`}
            >
              {g}
            </button>
          ))}
        </div>

        {gateway === "stripe" ? (
          <div className="space-y-1">
            <label className="text-[9px] font-bold text-slate-400 block uppercase font-mono">Stripe Secret Key</label>
            <input
              type="password"
              value={stripeKey}
              onChange={(e) => setStripeKey(e.target.value)}
              placeholder="sk_live_..."
              className="w-full max-w-md bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs font-mono text-slate-700 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition"
            />
          </div>
        ) : (
          <div className="space-y-1">
            <label className="text-[9px] font-bold text-slate-400 block uppercase font-mono">PayPal Business Email</label>
            <input
              type="email"
              value={paypalEmail}
              onChange={(e) => setPaypalEmail(e.target.value)}
              placeholder="merchant@example.com"
              className="w-full max-w-md bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs font-mono text-slate-700 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition"
            />
          </div>
        )}
      </div>

      <div className="flex items-center gap-3 pt-2">
        <button
          onClick={handleSave}
          className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs shadow-sm transition flex items-center gap-1.5"
        >
          <DollarSign className="w-3.5 h-3.5" />
          Save Billing Settings
        </button>
        <span className="text-[10px] text-slate-400">Payouts are processed on the 1st of each month.</span>
      </div>
    </div>
  );
}
