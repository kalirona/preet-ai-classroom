import React, { useState, useEffect } from "react";
import { Community, Transaction } from "../types";
import { DollarSign, ShieldAlert, TrendingUp, Calendar, ArrowUpRight, BarChart, Settings, Plus, Save, Sparkles, AlertCircle, Loader, Landmark } from "lucide-react";

interface CreatorDashboardProps {
  activeCommunity: Community | null;
  onUpdateCommunity: (updated: Partial<Community>) => Promise<any>;
}

export default function CreatorDashboard({
  activeCommunity,
  onUpdateCommunity
}: CreatorDashboardProps) {
  const [stats, setStats] = useState<any>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Field customization bindings for community landing page
  const [heroTitle, setHeroTitle] = useState("");
  const [heroSubtitle, setHeroSubtitle] = useState("");
  const [isUpdatingLanding, setIsUpdatingLanding] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Stripe payments simulation checkout state
  const [isCharging, setIsCharging] = useState(false);
  const [simulateSuccess, setSimulateSuccess] = useState(false);

  useEffect(() => {
    async function loadStats() {
      setIsLoading(true);
      try {
        const res = await fetch("/api/payments/mrr-stats");
        const data = await res.json();
        if (data.stats) {
          setStats(data.stats);
          setTransactions(data.stats.salesHistory || []);
        }
      } catch (e) {
        console.error("Dashboard stats loader experienced error:", e);
      } finally {
        setIsLoading(false);
      }
    }
    loadStats();

    if (activeCommunity) {
      setHeroTitle(activeCommunity.landingHeroTitle || "Level up your technical development career");
      setHeroSubtitle(activeCommunity.landingHeroSubtitle || "Supercharge your career with prompt engineers and advanced agent structures inside our private collective.");
    }
  }, [activeCommunity]);

  const handleUpdateLandingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeCommunity) return;
    setIsUpdatingLanding(true);
    setSaveSuccess(false);

    try {
      await onUpdateCommunity({
        landingHeroTitle: heroTitle,
        landingHeroSubtitle: heroSubtitle
      });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (er) {
      console.error(er);
    } finally {
      setIsUpdatingLanding(false);
    }
  };

  const handleSimulateCharge = async () => {
    if (!activeCommunity) return;
    setIsCharging(true);
    setSimulateSuccess(false);

    try {
      const createRes = await fetch("/api/payments/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          communityId: activeCommunity.id,
          amount: activeCommunity.priceMonthly || 49,
        }),
      });
      const createData = await createRes.json();
      if (!createData.success) throw new Error("Failed to create order");

      const captureRes = await fetch("/api/payments/capture-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: createData.orderId,
          communityId: activeCommunity.id,
        }),
      });
      const captureData = await captureRes.json();
      if (captureData.success && captureData.status === "COMPLETED") {
        const statsRes = await fetch("/api/payments/mrr-stats");
        const statsData = await statsRes.json();
        if (statsData.stats) {
          setStats(statsData.stats);
          setTransactions(statsData.stats.salesHistory || []);
        }

        setSimulateSuccess(true);
        setTimeout(() => setSimulateSuccess(false), 3500);
      }
    } catch (e) {
      console.error("PayPal payment flow err:", e);
    } finally {
      setIsCharging(false);
    }
  };

  return (
    <div className="p-6 h-full overflow-y-auto" id="creator-dashboard-workspace">

      {/* 1. KEY ADMINISTRATIVE METRICS (Bento Row) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        
        <div className="bg-white rounded-2xl border border-[#E5E7EB] p-5 shadow-sm">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 font-mono">Monthly Revenue</span>
            <span className="p-1 px-2 bg-emerald-50 text-emerald-700 rounded-md text-[9px] font-mono font-bold flex items-center gap-1">
              <TrendingUp className="w-2.5 h-2.5" />
              MRR Flow
            </span>
          </div>
          <div className="text-xl font-bold font-display mt-2 text-gray-900">
            ${stats?.mrr || 2400} / mo
          </div>
          <div className="text-[10px] text-gray-400 mt-1 font-mono">
            Annualized: ${stats?.arr || 28800} ARR
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-[#E5E7EB] p-5 shadow-sm">
          <span className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 font-mono">Active Members</span>
          <div className="text-xl font-bold font-display mt-2 text-gray-900">
            {stats?.activeStudents || 1420} students
          </div>
          <div className="text-[10px] text-gray-400 mt-1 font-mono">
            Platform Churn: {stats?.churnRate || "2.8%"} / mo
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-[#E5E7EB] p-5 shadow-sm">
          <span className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 font-mono">Starting Price</span>
          <div className="text-xl font-bold font-display mt-2 text-indigo-700">
            {activeCommunity?.priceMonthly ? `$${activeCommunity?.priceMonthly}` : "Free Community"}
          </div>
          <div className="text-[10px] text-gray-400 mt-1 font-mono">
            Subdomain: {activeCommunity?.subdomain}.skool.io
          </div>
        </div>

        {/* Action widget: stripe simulation trigger */}
        <div className="bg-gradient-to-br from-indigo-600 to-purple-700 text-white rounded-2xl p-5 shadow-sm flex flex-col justify-between">
          <div>
            <span className="text-[9px] uppercase font-mono tracking-widest text-indigo-200">Sandbox Testing</span>
            <div className="text-xs font-bold mt-1">Simulate Membership Sale</div>
          </div>
          <button
            onClick={handleSimulateCharge}
            disabled={isCharging}
            className="w-full py-1.5 bg-white text-indigo-700 hover:bg-indigo-50 font-bold rounded-xl text-[10px] transition mt-3 flex items-center justify-center gap-1.5 cursor-pointer"
          >
            {isCharging ? "Processing PayPal..." : "Simulate Paid Join +$49 MRR"}
          </button>
        </div>

      </div>

      {simulateSuccess && (
        <div className="bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl px-4 py-3 text-xs font-mono font-bold flex items-center gap-2 mb-4 animate-bounce">
          <AlertCircle className="w-4 h-4 text-emerald-600" />
          Payment completed! Transaction recorded. MRR boosted.
        </div>
      )}

      {/* 2. MRR GROWTH GRAPH AND TRANSACTIONS */}
      <div className="grid grid-cols-12 gap-6 mb-6">
        
        {/* GRAPH COLUMN (Left 7 Units) */}
        <div className="col-span-12 lg:col-span-7 bg-white rounded-2xl border border-[#E5E7EB] p-6 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-xs font-bold text-gray-400 tracking-wider font-mono uppercase mb-4">Earnings Velocity</h3>
            
            {/* SVG Visual graph matching design guidelines */}
            <div className="h-44 w-full bg-gray-50 rounded-xl p-3 border border-gray-100 flex flex-col justify-between">
              <div className="flex-1 flex items-end justify-between gap-2 px-4 pt-4">
                {stats?.chartData?.map((item: any) => {
                  const maxSales = Math.max(...stats.chartData.map((d: any) => d.sales));
                  const heightPercentage = Math.round((item.sales / maxSales) * 100);
                  
                  return (
                    <div key={item.month} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end group">
                      <div className="text-[10px] font-bold text-gray-700 opacity-0 group-hover:opacity-100 transition duration-150">
                        ${item.sales}
                      </div>
                      <div
                        className="w-full bg-indigo-600 hover:bg-indigo-500 rounded-t-md transition-all duration-300"
                        style={{ height: `${heightPercentage}%` }}
                      ></div>
                      <span className="text-[9px] font-mono text-gray-400 uppercase font-semibold">{item.month}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* TRANSACTIONS LOGS (Right 5 Units) */}
        <div className="col-span-12 lg:col-span-5 bg-white rounded-2xl border border-[#E5E7EB] p-6 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="text-xs font-bold text-gray-400 tracking-wider font-mono uppercase mb-3">Recent Transactions</h3>
            <div className="space-y-2.5 max-h-48 overflow-y-auto pr-1">
              {transactions.length === 0 ? (
                <div className="py-8 text-center text-xs text-gray-400">
                  Your sandbox shows no stripe billing history.
                </div>
              ) : (
                transactions.map((tx) => (
                  <div key={tx.id} className="flex items-center justify-between p-2.5 bg-gray-50 rounded-xl border border-gray-100 text-[11px]" id={`tx-item-${tx.id}`}>
                    <div>
                      <div className="font-bold text-gray-900 leading-tight">{tx.userName}</div>
                      <div className="text-[9px] text-gray-400 font-mono mt-0.5">{tx.userEmail}</div>
                    </div>
                    <div className="text-right font-mono">
                      <span className="font-bold text-indigo-700">+${tx.amount}</span>
                      <div className="text-[9px] text-gray-400">Paid</div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

      </div>

      {/* 3. LANDING PAGE DESIGN CUSTOMIZER FAQ / LANDING CONTENT */}
      <div className="bg-white rounded-2xl border border-[#E5E7EB] p-6 shadow-sm">
        <h3 className="text-sm font-bold text-gray-900 font-display mb-4 flex items-center gap-2">
          <Settings className="w-4 h-4 text-indigo-600" />
          Customize Your Subdomain Landing Page
        </h3>

        <form onSubmit={handleUpdateLandingSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Landing Hero Heading Title</label>
              <input
                type="text"
                required
                value={heroTitle}
                onChange={(e) => setHeroTitle(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 font-sans"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1 font-sans">Landing Hero Paragraph Subheading</label>
              <input
                type="text"
                required
                value={heroSubtitle}
                onChange={(e) => setHeroSubtitle(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 font-sans"
              />
            </div>
          </div>

          {saveSuccess && (
            <div className="text-xs text-green-700 bg-green-50 border border-green-200 rounded-xl p-3 font-semibold font-mono animate-fade-in">
              🚀 Success! Your custom SEO landing guidelines have updated. Open the landing portal to view coordinates.
            </div>
          )}

          <div className="flex justify-end pt-3">
            <button
              type="submit"
              disabled={isUpdatingLanding}
              className="px-5 py-2.5 bg-gray-900 hover:bg-gray-800 text-white font-bold rounded-xl text-xs transition flex items-center gap-2 cursor-pointer shadow-sm disabled:opacity-50"
            >
              <Save className="w-4 h-4 text-gray-300" />
              {isUpdatingLanding ? "Publishing layout..." : "Save Landing Configurations"}
            </button>
          </div>
        </form>
      </div>

    </div>
  );
}
