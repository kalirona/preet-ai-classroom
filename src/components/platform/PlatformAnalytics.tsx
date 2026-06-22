
interface PlatformAnalyticsProps {
  totalMRR: number;
  platformCommissionFee: number;
}

export default function PlatformAnalytics({ totalMRR, platformCommissionFee }: PlatformAnalyticsProps) {
  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-4">
        <div className="flex justify-between items-center flex-wrap gap-2">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 font-mono">Financial Trajectory</h3>
            <p className="text-[10px] text-slate-400 mt-0.5">MRR growth and platform commission calculations.</p>
          </div>
          <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-lg px-2.5 py-1">
            +28.4% YoY
          </span>
        </div>

        {/* SVG Multi-Line Trend Chart (Modern Minimalist visualization) */}
        <div className="pt-2">
          <span className="text-[9px] uppercase font-mono font-bold text-gray-400 block mb-3">Projected Platform MRR Index (USD)</span>
          <div className="h-64 bg-slate-900 border border-slate-950 rounded-2xl p-4 flex flex-col justify-between relative overflow-hidden font-mono text-[9px] text-slate-450">
            
            {/* Grid background rails */}
            <div className="absolute inset-0 grid grid-rows-4 pointer-events-none p-4">
              <div className="border-b border-white/5 w-full h-full" />
              <div className="border-b border-white/5 w-full h-full" />
              <div className="border-b border-white/5 w-full h-full" />
              <div className="w-full h-full" />
            </div>

            {/* SVG Line path vector */}
            <svg className="absolute inset-x-0 bottom-0 top-0 w-full h-full" overflow="visible" preserveAspectRatio="none">
              <defs>
                <linearGradient id="mrrArea" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="rgb(79, 70, 229)" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="rgb(79, 70, 229)" stopOpacity="0.0" />
                </linearGradient>
              </defs>
              {/* Area Gradient */}
              <path 
                d="M0 240 L80 200 L160 170 L240 190 L320 140 L400 150 L480 110 L560 120 L640 80 L720 90 L800 60 L880 40 L960 35 L1080 35 L1080 240 Z" 
                fill="url(#mrrArea)" 
              />
              {/* Core Line */}
              <path 
                d="M0 240 L80 200 L160 170 L240 190 L320 140 L400 150 L480 110 L560 120 L640 80 L720 90 L800 60 L880 40 L960 35 L1080 35" 
                fill="none" 
                stroke="rgb(79, 70, 229)" 
                strokeWidth="2.5" 
                strokeLinecap="round"
              />
              {/* Dot plot */}
              <circle cx="80" cy="200" r="3.5" fill="rgb(79, 70, 229)" stroke="white" strokeWidth="1" />
              <circle cx="320" cy="140" r="3.5" fill="rgb(79, 70, 229)" stroke="white" strokeWidth="1" />
              <circle cx="640" cy="80" r="3.5" fill="rgb(79, 70, 229)" stroke="white" strokeWidth="1" />
              <circle cx="880" cy="40" r="3.5" fill="rgb(79, 70, 229)" stroke="white" strokeWidth="1" />
              <circle cx="960" cy="35" r="4.5" fill="rgb(16, 185, 129)" stroke="white" strokeWidth="1.5" />
            </svg>

            {/* Spark line metadata indicator overlay */}
            <div className="absolute right-6 top-6 bg-slate-950/80 border border-slate-800 p-2.5 rounded-xl flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse block" />
              <div>
                <span className="text-[8px] text-slate-500 uppercase block font-mono">Current Peak</span>
                <span className="text-[10.5px] font-bold text-white font-mono">${(totalMRR).toLocaleString()} USD</span>
              </div>
            </div>

            {/* Y Axis Metrics */}
            <div className="flex flex-col justify-between h-44 border-r border-white/5 pr-2 z-10">
              <span>$25,000</span>
              <span>$18,000</span>
              <span>$12,000</span>
              <span>$5,000</span>
              <span>$0</span>
            </div>

            {/* X Axis Months */}
            <div className="flex justify-between border-t border-white/5 pt-2 pl-12 shrink-0 z-10 uppercase text-[8px] font-mono tracking-wider">
              <span>Jun</span>
              <span>Jul</span>
              <span>Aug</span>
              <span>Sep</span>
              <span>Oct</span>
              <span>Nov</span>
              <span>Dec</span>
              <span>Jan</span>
              <span>Feb</span>
              <span>Mar</span>
              <span>Apr</span>
              <span>May (2026)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Sub analytical KPI indicators */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm">
          <span className="text-[9px] text-slate-400 uppercase font-mono font-bold tracking-wider block">CLTV</span>
          <span className="text-xl font-extrabold text-slate-900 block mt-1 tracking-tight">$4,850</span>
          <span className="text-[10px] text-emerald-600 font-semibold block mt-1">
            +4.2% from last month
          </span>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm">
          <span className="text-[9px] text-slate-400 uppercase font-mono font-bold tracking-wider block">CAC</span>
          <span className="text-xl font-extrabold text-slate-900 block mt-1 tracking-tight">$312</span>
          <span className="text-[10px] text-emerald-600 font-semibold block mt-1">
            -8.4% cost reduction
          </span>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm">
          <span className="text-[9px] text-slate-400 uppercase font-mono font-bold tracking-wider block">PLATFORM FEE CUT</span>
          <span className="text-xl font-extrabold text-slate-900 block mt-1 tracking-tight">{platformCommissionFee}%</span>
          <span className="text-[10px] text-slate-500 font-semibold block mt-1">
            per transaction
          </span>
        </div>
      </div>
    </div>
  );
}
