import React from "react";
import { LucideIcon } from "lucide-react";

interface StatItem {
  value: string;
  label: string;
  icon?: LucideIcon;
}

interface StatsBarProps {
  stats: StatItem[];
  variant?: "light" | "dark";
}

export default function StatsBar({ stats, variant = "light" }: StatsBarProps) {
  const isDark = variant === "dark";
  return (
    <div className={`grid grid-cols-2 md:grid-cols-4 gap-6 ${isDark ? "bg-gray-900" : "bg-white"} rounded-2xl ${isDark ? "" : "border border-gray-200"} p-8`}>
      {stats.map((stat, i) => {
        const Icon = stat.icon;
        return (
          <div key={i} className="text-center">
            <p className={`text-3xl font-bold tracking-tight ${isDark ? "text-white" : "text-gray-900"}`}>{stat.value}</p>
            <div className="flex items-center justify-center gap-1.5 mt-1">
              {Icon && <Icon className={`w-3.5 h-3.5 ${isDark ? "text-gray-500" : "text-gray-400"}`} />}
              <p className={`text-xs ${isDark ? "text-gray-400" : "text-gray-500"}`}>{stat.label}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
