import React, { useState } from "react";
import { User } from "../../types";
import BrandingSettings from "./settings/BrandingSettings";
import AIProvidersSettings from "./settings/AIProvidersSettings";
import BillingSettings from "./settings/BillingSettings";
import FeatureFlagsSettings from "./settings/FeatureFlagsSettings";
import SystemMonitor from "./settings/SystemMonitor";
import AdminManagement from "./settings/AdminManagement";

interface PlatformSettingsProps {
  currentUser: User | null;
}

const TABS = [
  { key: "admin", label: "Admin Mgmt" },
  { key: "branding", label: "Branding" },
  { key: "ai-providers", label: "AI Providers" },
  { key: "billing", label: "Billing" },
  { key: "feature-flags", label: "Feature Flags" },
  { key: "system", label: "System" },
] as const;

export default function PlatformSettings({ currentUser }: PlatformSettingsProps) {
  const [activeTab, setActiveTab] = useState<string>("branding");

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Tab Navigation */}
      <div className="flex gap-1 bg-slate-100 rounded-2xl p-1.5 shadow-sm overflow-x-auto">
        {TABS.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
              activeTab === key
                ? "bg-white text-slate-800 shadow-sm border border-slate-200/80"
                : "text-slate-400 hover:text-slate-600"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === "admin" && <AdminManagement currentUser={currentUser} />}
      {activeTab === "branding" && <BrandingSettings />}
      {activeTab === "ai-providers" && <AIProvidersSettings />}
      {activeTab === "billing" && <BillingSettings />}
      {activeTab === "feature-flags" && <FeatureFlagsSettings />}
      {activeTab === "system" && <SystemMonitor />}
    </div>
  );
}
