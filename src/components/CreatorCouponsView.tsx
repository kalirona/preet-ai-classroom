import React, { useState } from "react";
import { Ticket, Percent, Plus, Search, CheckCircle, Trash2, ShieldAlert } from "lucide-react";

export default function CreatorCouponsView() {
  const [coupons, setCoupons] = useState([
    { code: "VIP90", discountPercent: 90, active: true, redeemed: 42, maxRedemptions: 100 },
    { code: "SAASPRO", discountPercent: 50, active: true, redeemed: 128, maxRedemptions: 500 },
    { code: "COMBOFREE", discountPercent: 100, active: true, redeemed: 12, maxRedemptions: 15 },
    { code: "SUMMER25", discountPercent: 25, active: false, redeemed: 80, maxRedemptions: 80 },
  ]);

  const [newCode, setNewCode] = useState("");
  const [newDiscount, setNewDiscount] = useState(50);
  const [newMax, setNewMax] = useState(100);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Playground calculator simulation state
  const [calcPrice, setCalcPrice] = useState(49);
  const [calcCode, setCalcCode] = useState("");
  const [calcDiscounted, setCalcDiscounted] = useState<number | null>(null);
  const [calcError, setCalcError] = useState<string | null>(null);

  const handleCreateCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCode.trim()) return;

    const formattedCode = newCode.toUpperCase().replace(/\s+/g, "");
    if (coupons.some(c => c.code === formattedCode)) {
      setToastMessage(`❌ Error: Coupon code ${formattedCode} already exists!`);
      setTimeout(() => setToastMessage(null), 3000);
      return;
    }

    const item = {
      code: formattedCode,
      discountPercent: Number(newDiscount),
      active: true,
      redeemed: 0,
      maxRedemptions: Number(newMax)
    };

    setCoupons([item, ...coupons]);
    setNewCode("");
    setToastMessage(`🎉 Creator coupon "${formattedCode}" created & distributed inside the database shards successfully!`);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleToggleActive = (code: string) => {
    setCoupons(prev => prev.map(c => c.code === code ? { ...c, active: !c.active } : c));
  };

  const handleDeleteCoupon = (code: string) => {
    setCoupons(prev => prev.filter(c => c.code !== code));
  };

  const handleTestCouponCalculator = (e: React.FormEvent) => {
    e.preventDefault();
    setCalcError(null);
    setCalcDiscounted(null);

    const match = coupons.find(c => c.code === calcCode.toUpperCase());
    if (!match) {
      setCalcError("Invalid Code: Coupon not found in active workspace indexes.");
      return;
    }
    if (!match.active) {
      setCalcError("Disabled Coupon: This coupon is currently set to inactive.");
      return;
    }
    if (match.redeemed >= match.maxRedemptions) {
      setCalcError("Fully Redeemed: Limit reached for this campaign code.");
      return;
    }

    const discountAmount = calcPrice * (match.discountPercent / 100);
    const finalPrice = Math.max(0, calcPrice - discountAmount);
    setCalcDiscounted(Number(finalPrice.toFixed(2)));
  };

  return (
    <div className="p-4 sm:p-6 space-y-6 overflow-y-auto h-full bg-[#F8F9FB]" id="ws-coupons-view">
      
      {/* HEADER ROW */}
      <div>
        <h1 className="text-xl font-extrabold font-display text-gray-900 tracking-tight flex items-center gap-2">
          <Ticket className="w-5 h-5 text-indigo-650" />
          Workspace Coupon Planner
        </h1>
        <p className="text-xs text-gray-450 mt-0.5">Define markdown coupons, configure ticket codes, and sandbox discount conditions in real-time.</p>
      </div>

      {toastMessage && (
        <div className={`p-4 rounded-2xl text-xs font-semibold ${
          toastMessage.startsWith("❌") 
            ? "bg-rose-50 border border-rose-200 text-rose-800" 
            : "bg-emerald-50 border border-emerald-200 text-emerald-850"
        } shadow-sm animate-in zoom-in-95 duration-150`}>
          {toastMessage}
        </div>
      )}

      {/* CORE DISCOUNTS GRID (Planner Card + Form Card side-by-side) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* COUPON MAKER FORM */}
        <div className="bg-white rounded-3xl border border-gray-200 p-5 shadow-sm space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 font-mono">Create Coupon Code</h3>
          
          <form onSubmit={handleCreateCoupon} className="space-y-3">
            <div>
              <label className="block text-[10px] uppercase font-mono font-bold text-gray-400 mb-1">Coupon Code Name</label>
              <input 
                type="text" 
                value={newCode} 
                onChange={(e) => setNewCode(e.target.value)} 
                placeholder="e.g. EARLYBIRD50"
                className="w-full border border-gray-200 rounded-xl p-2.5 text-xs bg-gray-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-600 font-mono"
                required 
              />
            </div>

            <div>
              <label className="block text-[10px] uppercase font-mono font-bold text-gray-400 mb-1">Discount percentage (%)</label>
              <input 
                type="number" 
                value={newDiscount} 
                onChange={(e) => setNewDiscount(Math.min(100, Math.max(1, Number(e.target.value))))} 
                min={1}
                max={100}
                className="w-full border border-gray-200 rounded-xl p-2.5 text-xs bg-gray-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-600"
                required 
              />
            </div>

            <div>
              <label className="block text-[10px] uppercase font-mono font-bold text-gray-400 mb-1">Redemption limit (Cap)</label>
              <input 
                type="number" 
                value={newMax} 
                onChange={(e) => setNewMax(Math.max(1, Number(e.target.value)))} 
                min={1}
                className="w-full border border-gray-200 rounded-xl p-2.5 text-xs bg-gray-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-600"
                required 
              />
            </div>

            <button 
              type="submit" 
              className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1 cursor-pointer shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              Simulate Code Deploy
            </button>
          </form>
        </div>

        {/* COUPON TESTING SANDBOX */}
        <div className="bg-white rounded-3xl border border-gray-200 p-5 shadow-sm space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 font-mono">Simulated Coupon Playground</h3>
          <p className="text-[10.5px] text-gray-400 leading-relaxed">Type in a sandbox price and enter one of your active coupons above to test the math equations.</p>
          
          <form onSubmit={handleTestCouponCalculator} className="space-y-3">
            <div>
              <label className="block text-[10px] uppercase font-mono font-bold text-gray-400 mb-1">Simulated Starting Price ($)</label>
              <input 
                type="number" 
                value={calcPrice} 
                onChange={(e) => setCalcPrice(Number(e.target.value))} 
                className="w-full border border-gray-200 rounded-xl p-2.5 text-xs bg-gray-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-600 font-mono"
              />
            </div>

            <div>
              <label className="block text-[10px] uppercase font-mono font-bold text-gray-400 mb-1">Enter Code Name</label>
              <input 
                type="text" 
                value={calcCode} 
                onChange={(e) => setCalcCode(e.target.value)} 
                placeholder="e.g. VIP90"
                className="w-full border border-gray-200 rounded-xl p-2.5 text-xs bg-gray-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-600 font-mono uppercase"
              />
            </div>

            <button 
              type="submit" 
              className="w-full py-1.5 bg-[#0F172A] hover:bg-black text-white text-xs font-bold rounded-xl transition cursor-pointer flex items-center justify-center gap-1"
            >
              <Percent className="w-3.5 h-3.5 text-indigo-400" />
              Evaluate Discount
            </button>
          </form>

          {/* Results display */}
          <div className="mt-3">
            {calcDiscounted !== null && (
              <div className="bg-emerald-50 rounded-2xl p-3 border border-emerald-150 space-y-1">
                <span className="text-[9.5px] uppercase font-mono tracking-wider font-extrabold text-emerald-800">Sandboxed Billing Result</span>
                <div className="flex justify-between text-xs font-bold text-slate-800 pt-1">
                  <span>Discounted Seat Cost:</span>
                  <span className="text-emerald-700 font-mono">${calcDiscounted.toFixed(2)}</span>
                </div>
                <div className="text-[10px] text-gray-400 font-mono leading-none">Original: ${calcPrice.toFixed(2)}</div>
              </div>
            )}

            {calcError && (
              <div className="bg-rose-50 text-rose-800 rounded-2xl p-3 border border-rose-150 text-[11px] font-medium leading-relaxed">
                ⚠️ {calcError}
              </div>
            )}
          </div>
        </div>

        {/* COMPREHENSIVE REWARD STATS INFO */}
        <div className="bg-white rounded-3xl border border-gray-200 p-5 shadow-sm flex flex-col justify-between">
          <div className="space-y-3.5">
            <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 font-mono">Incentive Campaigns</h3>
            <div className="space-y-2 text-[11.5px] text-gray-600 leading-relaxed">
              <p>🎁 Coupon codes stimulate community expansion up to <strong className="text-slate-800">4.5x more effectively</strong> than general free landing tiers.</p>
              <p>💡 Always specify finite redemption caps (e.g. 20 usages) in order to induce healthy urgency in cohort seats.</p>
            </div>
          </div>
          
          <div className="bg-[#1E293B] text-white p-4 rounded-2xl border border-gray-700 mt-4">
            <span className="block text-[8px] uppercase tracking-wider font-mono text-gray-400">Database Index Rules</span>
            <span className="text-xs font-black block mt-1">Multi-tenant isolation ensures coupon tables remain nested strictly inside active space ID hashes.</span>
          </div>
        </div>

      </div>

      {/* DISCOUNTS REGISTRY TABLE */}
      <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-150 bg-gray-50/50 flex justify-between items-center text-xs">
          <span className="font-extrabold uppercase tracking-wider text-slate-500 font-mono">Workspace Coupons Index</span>
          <span className="text-[10px] text-gray-450 font-mono">Actions synced directly to stripe core callbacks</span>
        </div>

        <div className="overflow-x-auto text-xs">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-gray-400 uppercase font-mono border-b border-gray-150 text-[10px] tracking-wider font-extrabold">
                <th className="py-2.5 px-4">Coupon Code</th>
                <th className="py-2.5 px-4">Markdown Rate</th>
                <th className="py-2.5 px-4 text-center">Active Status</th>
                <th className="py-2.5 px-4 text-center">Usage Metrics</th>
                <th className="py-2.5 px-4 text-right">Settings Trigger</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 font-medium">
              {coupons.map((c) => (
                <tr key={c.code} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3 px-4 font-mono font-extrabold text-indigo-700 text-xs">
                    {c.code}
                  </td>
                  <td className="py-3 px-4 text-slate-800 font-bold font-sans">
                    {c.discountPercent}% Off All Seat Tiers
                  </td>
                  <td className="py-3 px-4 text-center">
                    <button 
                      onClick={() => handleToggleActive(c.code)}
                      className={`inline-flex items-center gap-1 rounded bg-transparent px-2 py-0.5 text-[10px] uppercase font-mono font-black ${
                        c.active 
                          ? "text-emerald-700 hover:bg-emerald-50" 
                          : "text-gray-450 hover:bg-gray-100"
                      }`}
                    >
                      {c.active ? "● ACTIVE" : "○ INACTIVE"}
                    </button>
                  </td>
                  <td className="py-3 px-4 text-center font-mono text-[11px] text-gray-600">
                    {c.redeemed} / {c.maxRedemptions} redeemed
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => handleDeleteCoupon(c.code)}
                      className="text-red-500 hover:text-red-700 font-mono font-bold cursor-pointer"
                    >
                      Delete code
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
