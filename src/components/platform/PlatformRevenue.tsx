import React from "react";

interface PlatformRevenueProps {
  totalMRR: number;
  platformCommissionFee: number;
}

const PlatformRevenue: React.FC<PlatformRevenueProps> = ({
  totalMRR,
  platformCommissionFee,
}) => {
  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-4">
        <div>
          <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 font-mono">Revenue Distribution</h3>
          <p className="text-[10px] text-slate-400 mt-0.5">Stripe transactions, fees, and platform commission splits.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="p-5 bg-gradient-to-br from-slate-50 to-slate-100/50 border border-slate-200/80 rounded-2xl text-center space-y-1">
            <span className="text-[9px] uppercase font-mono font-bold text-slate-400 block">Total Volume</span>
            <span className="text-xl font-extrabold text-slate-900 font-sans tracking-tight">$94,842</span>
            <span className="text-[10px] text-emerald-600 font-bold block">+12% this cycle</span>
          </div>

          <div className="p-5 bg-gradient-to-br from-indigo-50 to-indigo-100/50 border border-indigo-200/80 rounded-2xl text-center space-y-1">
            <span className="text-[9px] uppercase font-mono font-bold text-indigo-400 block">Platform Fees ({platformCommissionFee}%)</span>
            <span className="text-xl font-extrabold text-indigo-700 font-sans tracking-tight">
              ${(totalMRR * (platformCommissionFee / 100) + 1240).toFixed(0)}
            </span>
            <span className="text-[10px] text-indigo-500 block font-mono">Commission earned</span>
          </div>

          <div className="p-5 bg-gradient-to-br from-rose-50 to-rose-100/50 border border-rose-200/80 rounded-2xl text-center space-y-1">
            <span className="text-[9px] uppercase font-mono font-bold text-rose-400 block">Failed Charges</span>
            <span className="text-xl font-extrabold text-rose-600 font-sans tracking-tight">$84</span>
            <span className="text-[10px] text-slate-400 block">Auto-recovery active</span>
          </div>
        </div>

        <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl flex flex-col sm:flex-row items-center justify-around gap-6">
          <div className="w-32 h-32 relative shrink-0">
            <svg width="100%" height="100%" viewBox="0 0 42 42" className="rotate-270">
              <circle cx="21" cy="21" r="15.915" fill="transparent" stroke="rgb(31, 41, 55)" strokeWidth="4.5" />
              <circle cx="21" cy="21" r="15.915" fill="transparent" stroke="rgb(16, 185, 129)" strokeWidth="4.5" strokeDasharray="97 3" strokeDashoffset="0" />
              <circle cx="21" cy="21" r="15.915" fill="transparent" stroke="rgb(99, 102, 241)" strokeWidth="4.5" strokeDasharray="3 97" strokeDashoffset="-97" />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center font-mono">
              <span className="text-xs font-bold text-white">97 : 3</span>
              <span className="text-[7.5px] text-slate-500 uppercase">Split</span>
            </div>
          </div>

          <div className="space-y-2.5 text-xs text-slate-300 flex-1">
            <h4 className="font-bold text-white font-mono text-xs uppercase">Fee Sharing Policy</h4>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 block shrink-0" />
              <span><strong className="text-white">97%</strong> goes to content creators via Stripe Connect</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 block shrink-0" />
              <span><strong className="text-white">{platformCommissionFee}%</strong> platform commission</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlatformRevenue;
