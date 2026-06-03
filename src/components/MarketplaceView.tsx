import React, { useState } from "react";
import { Community, User } from "../types";
import { Search, Globe, CreditCard, Sparkles, CheckCircle2, Star, ShoppingBag, Loader2 } from "lucide-react";

interface MarketplaceViewProps {
  currentUser: User | null;
  communities: Community[];
  onJoinCommunityLocal: (communityId: string, subscriptionAmount: number) => void;
}

export default function MarketplaceView({ currentUser, communities, onJoinCommunityLocal }: MarketplaceViewProps) {
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState<"all" | "free" | "paid">("all");
  const [checkingOutCommId, setCheckingOutCommId] = useState<string | null>(null);

  const handleCheckout = async (comm: Community) => {
    setCheckingOutCommId(comm.id);
    try {
      const createRes = await fetch("/api/payments/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          communityId: comm.id,
          amount: comm.priceMonthly || 0,
        }),
      });
      const createData = await createRes.json();
      if (!createData.success) throw new Error("Failed to create order");

      const captureRes = await fetch("/api/payments/capture-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: createData.orderId,
          communityId: comm.id,
        }),
      });
      const captureData = await captureRes.json();
      if (captureData.success && captureData.status === "COMPLETED") {
        onJoinCommunityLocal(comm.id, comm.priceMonthly);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setCheckingOutCommId(null);
    }
  };

  const filtered = communities.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(search.toLowerCase()) || 
                          c.description.toLowerCase().includes(search.toLowerCase());
    
    if (filterType === "free") return matchesSearch && !c.isPremium;
    if (filterType === "paid") return matchesSearch && c.isPremium;
    return matchesSearch;
  });

  return (
    <div className="h-full flex flex-col bg-[#F8F9FB] overflow-y-auto" id="marketplace-view">
      <div className="max-w-6xl w-full mx-auto p-4 sm:p-6 space-y-6">
        
        {/* Banner header bento box */}
        <div className="bg-gradient-to-r from-slate-900 to-indigo-950 text-white rounded-3xl p-8 relative overflow-hidden shadow-lg">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <ShoppingBag className="w-48 h-48 text-indigo-400 rotate-12" />
          </div>
          
          <div className="z-10 max-w-xl position-relative">
            <span className="text-[10px] uppercase font-mono tracking-widest bg-indigo-500/30 px-3 py-1 rounded-full text-indigo-200">
              SaaS Marketplace Discovery
            </span>
            <h2 className="text-xl font-bold font-display mt-3 leading-tight">Find and join world-class training groups</h2>
            <p className="text-xs text-indigo-200 mt-2 leading-relaxed">
              Unlock private communities, plan high-end pricing matrices, and configure complete Stripe multi-tenant sub-tiers safely from this sandbox catalogue.
            </p>
          </div>
        </div>

        {/* Discovery Filters Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
          <div className="md:col-span-8 relative">
            <Search className="absolute left-3.5 top-3 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search available premium spaces, niches, topics..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-white border border-[#E5E7EB] rounded-xl pl-10 pr-4 py-2.5 text-xs text-gray-950 focus:outline-none focus:ring-1 focus:ring-indigo-500 shadow-sm"
            />
          </div>
          <div className="md:col-span-4 flex gap-2">
            <button
              onClick={() => setFilterType("all")}
              className={`flex-1 py-2 rounded-xl text-xs font-semibold border transition cursor-pointer ${
                filterType === "all" ? "bg-indigo-600 text-white border-indigo-600" : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilterType("free")}
              className={`flex-1 py-2 rounded-xl text-xs font-semibold border transition cursor-pointer ${
                filterType === "free" ? "bg-indigo-600 text-white border-indigo-600" : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
              }`}
            >
              Free
            </button>
            <button
              onClick={() => setFilterType("paid")}
              className={`flex-1 py-2 rounded-xl text-xs font-semibold border transition cursor-pointer ${
                filterType === "paid" ? "bg-indigo-600 text-white border-indigo-600" : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
              }`}
            >
              Premium
            </button>
          </div>
        </div>

        {/* Catalog List */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {filtered.map((comm) => {
            const hasJoined = currentUser?.joinedCommunities.includes(comm.id);
            const checkingOut = checkingOutCommId === comm.id;
            
            return (
              <div key={comm.id} className="bg-white rounded-3xl border border-[#E5E7EB] p-6 shadow-sm flex flex-col justify-between hover:shadow-md transition">
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <div className="w-12 h-12 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center font-bold text-lg">
                      {comm.branding?.logoUrl || "💡"}
                    </div>
                    {comm.isPremium ? (
                      <span className="px-2.5 py-1 bg-amber-50 text-amber-850 font-mono text-[9px] font-bold uppercase rounded-full border border-amber-100">
                        ${comm.priceMonthly}/mo USD
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 bg-emerald-50 text-emerald-800 font-mono text-[9px] font-bold uppercase rounded-full border border-emerald-100">
                        Free Lifetime
                      </span>
                    )}
                  </div>

                  <h3 className="text-sm font-bold text-gray-900 leading-snug">{comm.name}</h3>
                  <p className="text-[10px] text-gray-400 font-mono mt-1 flex items-center gap-1.5 uppercase">
                    <Globe className="w-3 h-3 text-indigo-500" />
                    {comm.subdomain}.skool.sh
                  </p>
                  
                  <p className="text-xs text-gray-500 mt-3 leading-relaxed">
                    {comm.description.substring(0, 130)}...
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between">
                  <span className="text-[10px] font-mono text-gray-400">
                    👥 {comm.membersCount} participants active
                  </span>
                  
                  {hasJoined ? (
                    <span className="text-xs text-emerald-600 font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      Participant Active
                    </span>
                  ) : (
                    <button
                      type="button"
                      disabled={checkingOut}
                      onClick={() => handleCheckout(comm)}
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-750 disabled:opacity-50 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 transition cursor-pointer shadow-sm"
                    >
                      {checkingOut ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          Paying...
                        </>
                      ) : (
                        <>
                          <CreditCard className="w-3.5 h-3.5" />
                          {comm.isPremium ? "Confirm checkout" : "Enroll now"}
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
}
