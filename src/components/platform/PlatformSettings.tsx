import React, { useState } from "react";
import { User } from "../../types";
import DashboardOverview from "./settings/DashboardOverview";
import AdminManagement from "./settings/AdminManagement";
import AISettings from "./settings/AISettings";
import BillingRevenue from "./settings/BillingRevenue";
import PlatformBranding from "./settings/PlatformBranding";
import EmailSettings from "./settings/EmailSettings";
import SecuritySettings from "./settings/SecuritySettings";
import MaintenanceSystem from "./settings/MaintenanceSystem";

interface PlatformSettingsProps {
  currentUser: User | null;
}

const TABS = [
  { key: "overview", label: "Dashboard" },
  { key: "admin", label: "Admin Mgmt" },
  { key: "ai", label: "AI" },
  { key: "billing", label: "Billing" },
  { key: "branding", label: "Branding" },
  { key: "email", label: "Email" },
  { key: "security", label: "Security" },
  { key: "system", label: "System" },
] as const;

export default function PlatformSettings({ currentUser }: PlatformSettingsProps) {
  const [activeTab, setActiveTab] = useState<string>("overview");

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
      {activeTab === "overview" && <DashboardOverview />}
      {activeTab === "admin" && <AdminManagement currentUser={currentUser} />}
      {activeTab === "ai" && <AISettings />}
      {activeTab === "billing" && <BillingRevenue />}
      {activeTab === "branding" && <PlatformBranding />}
      {activeTab === "email" && <EmailSettings />}
      {activeTab === "security" && <SecuritySettings />}
      {activeTab === "system" && <MaintenanceSystem />}
    </div>
  );
}
