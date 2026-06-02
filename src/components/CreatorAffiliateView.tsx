import React, { useState } from "react";
import { HeartHandshake, Link, Share2, Search, Percent, Save, Sparkles, CheckCircle, Plus } from "lucide-react";

export default function CreatorAffiliateView() {
  const [commissionRate, setCommissionRate] = useState(25);
  const [partners, setPartners] = useState([
    { id: "partner-1", name: "Alice Smith", email: "alice@lucid.io", code: "ALICE25", clicks: 120, conversions: 18, earned: 220.50 },
    { id: "partner-2", name: "Bob Johnson", email: "bob@jones.com", code: "BOBBY_CORE", clicks: 45, conversions: 2, earned: 24.50 },
    { id: "partner-3", name: "Charlie Brown", email: "charlie@peanuts.net", code: "SNOOPY", clicks: 231, conversions: 35, earned: 428.75 },
    { id: "partner-4", name: "Zendaya Coleman", email: "z@euphoria.org", code: "ZEN_COHORT", clicks: 512, conversions: 80, earned: 980.00 },
  ]);

  const [newPartnerName, setNewPartnerName] = useState("");
  const [newPartnerEmail, setNewPartnerEmail] = useState("");
  const [newCode, setNewCode] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const handleCreateAffiliate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPartnerName || !newPartnerEmail) return;

    const code = newCode.trim() 
      ? newCode.toUpperCase().replace(/\s+/g, "")
      : `${newPartnerName.substring(0, 4).toUpperCase()}${Math.floor(Math.random() * 100)}`;

    const partner = {
      id: `partner-${Math.random().toString(36).substring(2, 6)}`,
      name: newPartnerName,
      email: newPartnerEmail,
      code,
      clicks: 0,
      conversions: 0,
      earned: 0
    };

    setPartners([partner, ...partners]);
    setNewPartnerName("");
    setNewPartnerEmail("");
    setNewCode("");
    setShowForm(false);
    setToast(`🎉 Affiliate link generated successfully! Member "${partner.name}" has been assigned custom tracking tag: ${partner.code}`);
    setTimeout(() => setToast(null), 4500);
  };

  const handleSaveCommissionRate = () => {
    setToast(`💾 Core contract updated: Affiliate commission set to ${commissionRate}% flat.`);
    setTimeout(() => setToast(null), 3000);
  };

  // KPIs
  const totalClicks = partners.reduce((sum, p) => sum + p.clicks, 0);
  const totalConversions = partners.reduce((sum, p) => sum + p.conversions, 0);
  const totalPayout = partners.reduce((sum, p) => sum + p.earned, 0);
  const convRate = totalClicks > 0 ? Number(((totalConversions / totalClicks) * 100).toFixed(1)) : 0;

  return (
    <div className="p-4 sm:p-6 space-y-6 overflow-y-auto h-full bg-[#F8F9FB]" id="ws-affiliate-view">
      
      {/* HEADER ROW */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold font-display text-gray-900 tracking-tight flex items-center gap-2">
            <HeartHandshake className="w-5 h-5 text-indigo-650" />
            Affiliate Program Orchestrator
          </h1>
          <p className="text-xs text-gray-450 mt-0.5">Configure profit-sharing coefficients, fetch referral click counts, and manage student partners.</p>
        </div>

        <button 
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-slate-900 hover:bg-black text-white text-xs font-bold rounded-xl transition cursor-pointer flex items-center gap-1.5 shadow-sm self-start sm:self-center"
        >
          <Plus className="w-4 h-4 text-indigo-300" />
          Onboard Affiliate
        </button>
      </div>

      {toast && (
        <div className="bg-indigo-50 border border-indigo-200 text-indigo-850 p-4 rounded-2xl text-xs font-semibold flex items-center gap-2 shadow-sm animate-in zoom-in-95 duration-150">
          <CheckCircle className="w-4 h-4 text-indigo-600 shrink-0" />
          <span>{toast}</span>
        </div>
      )}

      {/* OVERVIEW CONTENT AND CONFIG BENTO ROW */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* COMMISSION RULESET FORMS */}
        <div className="bg-white rounded-3xl border border-gray-200 p-5 shadow-sm space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 font-mono">Commission Contract</h3>
          <p className="text-[11px] text-gray-400 leading-relaxed font-sans">Set default payout percentages for organic student referrals. Commissions clear automatically in cash ledger integrations.</p>
          
          <div className="space-y-3.5">
            <div>
              <label className="block text-[10px] uppercase font-mono font-bold text-gray-400 mb-1">Commission Split (%)</label>
              <div className="flex gap-2">
                <input 
                  type="number" 
                  value={commissionRate} 
                  onChange={(e) => setCommissionRate(Math.min(100, Math.max(1, Number(e.target.value))))} 
                  min={1}
                  max={100}
                  className="w-full border border-gray-200 rounded-xl p-2 text-xs bg-gray-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-600 font-mono font-bold"
                />
                <button 
                  onClick={handleSaveCommissionRate}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1 cursor-pointer shrink-0"
                >
                  <Save className="w-3.5 h-3.5" />
                  Apply Rate
                </button>
              </div>
            </div>

            <div className="bg-indigo-50/50 rounded-2xl p-3.5 border border-indigo-150 space-y-1 text-indigo-900">
              <span className="text-[9px] font-mono uppercase font-black tracking-widest block text-indigo-700">Contract Simulator</span>
              <p className="text-[11px] leading-relaxed">
                A student referring a subscriber onto your <strong>$49/month seat</strong> will clear a net <strong>${(49 * (commissionRate / 100)).toFixed(2)}/month recurring payout</strong> automatically.
              </p>
            </div>
          </div>
        </div>

        {/* ONBOARD PARTNER FORM */}
        {showForm && (
          <div className="bg-white border border-gray-200 rounded-3xl p-5 shadow-md animate-in slide-in-from-top-4 duration-200">
            <div className="flex justify-between items-center border-b border-gray-150 pb-2 mb-3">
              <span className="text-xs font-bold uppercase tracking-wide text-slate-800 font-mono">Affiliate Form Builder</span>
              <button onClick={() => setShowForm(false)} className="text-xs text-gray-400 hover:text-gray-600 font-bold">Cancel</button>
            </div>

            <form onSubmit={handleCreateAffiliate} className="space-y-3">
              <div>
                <label className="block text-[10px] uppercase font-mono font-bold text-gray-400 mb-1">Affiliate Full Name</label>
                <input 
                  type="text" 
                  value={newPartnerName} 
                  onChange={(e) => setNewPartnerName(e.target.value)} 
                  placeholder="e.g. Keanu Reeves"
                  className="w-full border border-gray-200 rounded-xl p-2 text-xs bg-gray-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-600"
                  required 
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase font-mono font-bold text-gray-400 mb-1">Partner Email Destination</label>
                <input 
                  type="email" 
                  value={newPartnerEmail} 
                  onChange={(e) => setNewPartnerEmail(e.target.value)} 
                  placeholder="keanu@matrix.com"
                  className="w-full border border-gray-200 rounded-xl p-2 text-xs bg-gray-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-600"
                  required 
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase font-mono font-bold text-gray-400 mb-1">Custom Promo Code (Optional)</label>
                <input 
                  type="text" 
                  value={newCode} 
                  onChange={(e) => setNewCode(e.target.value)} 
                  placeholder="MATRIX99"
                  className="w-full border border-gray-200 rounded-xl p-2 text-xs bg-gray-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-600 font-mono"
                />
              </div>

              <button 
                type="submit" 
                className="w-full py-2 bg-[#0F172A] hover:bg-black text-white text-xs font-bold rounded-xl transition shadow-sm flex items-center justify-center gap-1 cursor-pointer"
              >
                Onboard & Generate Referral Code
              </button>
            </form>
          </div>
        )}

        {/* REVENUE SPLIT INFO */}
        <div className="lg:col-span-2 bg-gradient-to-br from-indigo-950 to-slate-900 rounded-3xl p-5 text-white flex flex-col justify-between">
          <div className="space-y-2">
            <span className="inline-flex items-center gap-1 bg-white/10 px-2.5 py-0.5 rounded-full text-[9px] font-mono tracking-widest uppercase">
              Network Analytics
            </span>
            <h3 className="text-base font-black font-display tracking-tight leading-snug">Empower your student community to promote your brand for you.</h3>
            <p className="text-xs text-indigo-200 font-medium leading-relaxed">
              Top Skool creators drive up to <strong className="text-white">65% of net recurring MRR</strong> purely through student-led affiliate marketing loops.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 border-t border-slate-700/50 pt-4 mt-4 text-xs">
            <div>
              <span className="text-[10px] text-gray-400 font-mono uppercase">Total Tracking clicks</span>
              <strong className="block text-base font-display text-white mt-0.5">{totalClicks.toLocaleString()}</strong>
            </div>
            <div>
              <span className="text-[10px] text-gray-400 font-mono uppercase">Conversions count</span>
              <strong className="block text-base font-display text-emerald-400 mt-0.5">{totalConversions.toLocaleString()} ({convRate}%)</strong>
            </div>
          </div>
        </div>

      </div>

      {/* CORE KPI SUMMARY */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        
        <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm flex justify-between items-center">
          <div>
            <span className="text-[10px] text-gray-400 uppercase font-mono block">Conversions Rate</span>
            <strong className="text-lg font-bold font-display text-slate-800 mt-1 block">{convRate}% conversion to seat</strong>
          </div>
          <div className="p-3 bg-emerald-50 text-emerald-700 rounded-2xl">
            <Share2 className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm flex justify-between items-center">
          <div>
            <span className="text-[10px] text-gray-400 uppercase font-mono block">Commissions Paid (YTD)</span>
            <strong className="text-lg font-bold font-display text-indigo-700 mt-1 block">${totalPayout.toFixed(2)}</strong>
          </div>
          <div className="p-3 bg-indigo-50 text-indigo-750 rounded-2xl">
            <HeartHandshake className="w-5 h-5" />
          </div>
        </div>

      </div>

      {/* PARTNERS DATABASE GRID TABLE */}
      <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-150 bg-gray-50/50 flex justify-between items-center text-xs">
          <span className="font-extrabold uppercase tracking-wider text-slate-500 font-mono">Student Affiliate Partners</span>
          <span className="text-[10px] text-gray-400 font-mono">Sandbox affiliate log tables</span>
        </div>

        <div className="overflow-x-auto text-xs">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-gray-400 uppercase font-mono border-b border-gray-150 text-[10px] tracking-wider font-extrabold">
                <th className="py-2.5 px-4">Affiliate Name</th>
                <th className="py-2.5 px-4">Tracking Code</th>
                <th className="py-2.5 px-4 text-center">Referral Clicks</th>
                <th className="py-2.5 px-4 text-center">Seat Conversions</th>
                <th className="py-2.5 px-4 text-right">Commission Earned</th>
                <th className="py-2.5 px-4 text-right">Affiliate Link</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 font-medium">
              {partners.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3 px-4">
                    <div>
                      <span className="font-bold text-slate-800 block text-xs">{p.name}</span>
                      <span className="text-gray-450 text-[10px] font-mono leading-none">{p.email}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 font-mono font-extrabold text-indigo-700">
                    {p.code}
                  </td>
                  <td className="py-3 px-4 text-center font-mono font-bold text-slate-800">
                    {p.clicks}
                  </td>
                  <td className="py-3 px-4 text-center font-mono font-bold text-slate-800">
                    {p.conversions}
                  </td>
                  <td className="py-3 px-4 text-right font-mono font-bold text-emerald-650">
                    ${p.earned.toFixed(2)}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <span className="inline-flex items-center gap-1 text-[10px] font-mono text-gray-400">
                      <Link className="w-3 h-3 text-indigo-500" />
                      skool.io/?ref={p.code.toLowerCase()}
                    </span>
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
