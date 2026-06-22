import { useState, useEffect } from "react";
import { Users, Building2, BookOpen, DollarSign, CreditCard, UserPlus, Activity, Layers } from "lucide-react";

interface PlatformStats {
  users: number;
  workspaces: number;
  members: number;
  posts: number;
  courses: number;
}

const CARD_STYLE = "bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm space-y-2";

export default function DashboardOverview() {
  const [stats, setStats] = useState<PlatformStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/platform/stats")
      .then((r) => r.json())
      .then((data) => setStats(data))
      .catch((err: unknown) => { console.error("Failed to load platform stats:", err); setStats(null); })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="text-center py-16 text-sm text-slate-400">Loading dashboard...</div>;
  }

  const cards = [
    { label: "Total Users", value: stats?.users ?? 0, icon: Users, color: "text-indigo-600 bg-indigo-50" },
    { label: "Active Members", value: stats?.members ?? 0, icon: Activity, color: "text-emerald-600 bg-emerald-50" },
    { label: "Active Workspaces", value: stats?.workspaces ?? 0, icon: Building2, color: "text-blue-600 bg-blue-50" },
    { label: "Total Courses", value: stats?.courses ?? 0, icon: BookOpen, color: "text-violet-600 bg-violet-50" },
    { label: "Monthly Revenue", value: "$0", icon: DollarSign, color: "text-amber-600 bg-amber-50" },
    { label: "Pending Payouts", value: "$0", icon: CreditCard, color: "text-rose-600 bg-rose-50" },
    { label: "New Signups", value: "+0", icon: UserPlus, color: "text-cyan-600 bg-cyan-50" },
    { label: "Active Communities", value: stats?.workspaces ?? 0, icon: Layers, color: "text-slate-600 bg-slate-100" },
  ];

  return (
    <div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className={CARD_STYLE}>
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-400 uppercase font-mono tracking-wider">{label}</span>
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${color}`}>
                <Icon className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-bold text-slate-900">{value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
