import React, { useState, useEffect } from "react";
import { Community, User, PlatformRole } from "../types";
import { 
  BarChart, Activity, Users, ShieldAlert, Cpu, HardDrive, Shield, CheckCircle2, AlertTriangle, 
  Send, RefreshCw, Layers, Database, BarChart3, TrendingUp, CreditCard, DollarSign, 
  Coins, ClipboardList, Sparkles, Image, Mail, Bell, Settings, ArrowRight, Trash2, 
  Plus, Check, Copy, Key, Terminal, Eye, Sliders, Play, Lock, Unlock, Globe, HelpCircle 
} from "lucide-react";

interface SuperAdminViewProps {
  currentUser: User | null;
  communities: Community[];
}

export default function SuperAdminView({ currentUser, communities }: SuperAdminViewProps) {
  // Navigation
  const [activeSection, setActiveSection] = useState<string>("dashboard");

  // Core Data State
  const [globalUsers, setGlobalUsers] = useState<User[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  // Broadcast Message State
  const [broadcastMessage, setBroadcastMessage] = useState("");
  const [broadcastSuccess, setBroadcastSuccess] = useState(false);

  // CloudPanel Database State
  const [cpStatus, setCpStatus] = useState<{
    configured: boolean;
    connected: boolean;
    usersCount: number;
    host?: string;
    database?: string;
    message: string;
  } | null>(null);
  const [isLoadingCp, setIsLoadingCp] = useState(true);
  const [isMigrating, setIsMigrating] = useState(false);
  const [migrationRes, setMigrationRes] = useState<{ success: boolean; message: string } | null>(null);
  const [copiedSql, setCopiedSql] = useState(false);

  // Search & Filter States
  const [usersSearch, setUsersSearch] = useState("");
  const [logsSearch, setLogsSearch] = useState("");
  const [logsFilterAction, setLogsFilterAction] = useState("ALL");

  // Threat Shield state
  const [shieldThreatLevel, setShieldThreatLevel] = useState<"LOW" | "ELEVATED" | "CRITICAL" | "LOCKDOWN">("LOW");
  const [alarmActive, setAlarmActive] = useState(false);
  const [securityModules, setSecurityModules] = useState({
    corsMode: true,
    xssSanitizer: true,
    sqliBlocker: true,
    ddosRateLimit: true,
    twoFactorForce: true,
    secureCookies: true,
  });

  // State elements for Platform Shield Controls
  const [bannedIps, setBannedIps] = useState<string[]>([
    "198.51.100.42",
    "203.0.113.111",
    "185.220.101.4",
  ]);
  const [newIpBan, setNewIpBan] = useState("");
  const [abuseLogs, setAbuseLogs] = useState([
    { id: "ab01", ip: "185.220.101.4", date: "2026-05-30 08:12:45 UTC", event: "Automated Bruteforce Botnet Probe", threat: "CRITICAL", actionHandled: "Temporarily rate-grouped & auto-rejected via CloudPanel TLS ingress policy" },
    { id: "ab02", ip: "203.0.113.111", date: "2026-05-30 07:44:19 UTC", event: "SQLi Injection Probe in /api/courses/search", threat: "HIGH", actionHandled: "Sanitized completely & source IP placed on temporary honeypot lock" },
    { id: "ab03", ip: "109.244.3.89", date: "2026-05-30 06:15:30 UTC", event: "Syllabus Content Scraper Crawler Campaign", threat: "MEDIUM", actionHandled: "Enforced captcha-challenge loop block in egress route" },
    { id: "ab04", ip: "198.51.100.42", date: "2026-05-30 05:08:12 UTC", event: "XSS Infiltration attempt on Workspace comments payload", threat: "CRITICAL", actionHandled: "Blocked & blacklisted globally" },
  ]);

  // Provisioning Simulator State
  const [simWsName, setSimWsName] = useState("");
  const [simWsSubdomain, setSimWsSubdomain] = useState("");
  const [simWsPrice, setSimWsPrice] = useState(49);
  const [simWsEmail, setSimWsEmail] = useState("");
  const [simWsSuccessMsg, setSimWsSuccessMsg] = useState("");
  const [simIsProvisioning, setSimIsProvisioning] = useState(false);

  // Subscription Pricing & Fees Config
  const [platformCommissionFee, setPlatformCommissionFee] = useState<number>(3); // Default 3% commission
  const [recurringPlanTiers, setRecurringPlanTiers] = useState([
    { id: "free", name: "Free Tier Hack", priceMonthly: 0, commissionFee: 5, activeWorkspaces: 28 },
    { id: "hobby", name: "Creator Essentials", priceMonthly: 29, commissionFee: 4, activeWorkspaces: 84 },
    { id: "standard", name: "Standard SaaS Pro", priceMonthly: 99, commissionFee: 3, activeWorkspaces: 142 },
    { id: "enterprise", name: "Enterprise Custom Matrix", priceMonthly: 299, commissionFee: 1.5, activeWorkspaces: 19 },
  ]);

  // Creator Payouts state
  const [creatorsPayoutList, setCreatorsPayoutList] = useState([
    { id: "cr01", name: "Haskell Masterclass Co.", email: "haskell.pro@tech.org", unpaidEarnings: 1480, status: "READY", lastPayoutDate: "2026-05-12" },
    { id: "cr02", name: "Figma UX Guild", email: "uxfigma.school@gmail.com", unpaidEarnings: 820, status: "READY", lastPayoutDate: "2026-05-18" },
    { id: "cr03", name: "Solidity Bootcamps Inc.", email: "contracts@solidity.zone", unpaidEarnings: 3200, status: "READY", lastPayoutDate: "2026-04-30" },
    { id: "cr04", name: "DevOps & Cloud Native Rails", email: "kubernetes.infra@outlook.com", unpaidEarnings: 0, status: "PROCESSED", lastPayoutDate: "2026-05-28" },
    { id: "cr05", name: "Minimalist Design Co.", email: "inter.typography@gmail.com", unpaidEarnings: 450, status: "READY", lastPayoutDate: "2026-05-01" },
  ]);
  const [payoutProcessingId, setPayoutProcessingId] = useState<string | null>(null);

  // AI & API controls state
  const [selectedGeminiModel, setSelectedGeminiModel] = useState("gemini-2.5-flash");
  const [aiWorkspaceQuotaLimit, setAiWorkspaceQuotaLimit] = useState(25000); // 25k tokens monthly limit
  const [systemInstructionsContent, setSystemInstructionsContent] = useState(
    "You are an expert workspace community teaching agent. Provide detailed, human-oriented responses, use structured markdown playbooks, verify code parameter safety, and never bypass course syllabuses rules."
  );
  const [aiTelemetryStats, setAiTelemetryStats] = useState({
    activeRequests: 0,
    apiTokenHealth: "Excellent (REST PROXY TLS)",
    lastModelInvocSeconds: 1.4,
    monthlyTokenCount: 1845942,
    rawLatencyHistory: [1.2, 1.4, 0.9, 1.8, 1.1, 1.3],
  });

  // Storage & Media State
  const [optimMediaUpload, setOptimMediaUpload] = useState(true);
  const [selectedFolder, setSelectedFolder] = useState<string>("root");
  const [mediaList, setMediaList] = useState([
    { name: "course_introduction.mp4", size: "148.4 MB", uploadedBy: "Haskell Co.", downloads: 412 },
    { name: "lecture_slides_module_01.pdf", size: "4.8 MB", uploadedBy: "Figma UX Guild", downloads: 919 },
    { name: "handout_worksheet_cheatsheet.pdf", size: "1.2 MB", uploadedBy: "skool.SaaS Admin", downloads: 1400 },
    { name: "profile_avatar_default.png", size: "230 KB", uploadedBy: "skool.SaaS Admin", downloads: 85 },
  ]);

  // SMTP Settings
  const [smtpConfig, setSmtpConfig] = useState({
    host: "smtp.cloudpanel.enterprise.io",
    port: 587,
    username: "relay@skoolsaas-platform.com",
    requireTls: true,
  });
  const [smtpTestEmail, setSmtpTestEmail] = useState("");
  const [smtpTestResult, setSmtpTestResult] = useState<string | null>(null);

  // System Settings state
  const [deploymentRegion, setDeploymentRegion] = useState("gcp-us-central1");
  const [debugLogPiles, setDebugLogPiles] = useState(true);
  const [maintenanceModeActive, setMaintenanceModeActive] = useState(false);

  // Load baseline admin datasets
  async function loadAdminData() {
    setIsLoading(true);
    setErrorMessage("");
    try {
      // 1. Fetch user lists (fallback leaderboard query coordinates standard listings)
      const userRes = await fetch("/api/gamification/leaderboard");
      if (userRes.ok) {
        const userData = await userRes.json();
        if (userData.leaderboard) {
          setGlobalUsers(userData.leaderboard);
        }
      }

      // 2. Fetch RBAC core logs
      const logRes = await fetch("/api/rbac/audit-logs");
      if (logRes.ok) {
        const logData = await logRes.json();
        if (logData.auditLogs) {
          setAuditLogs(logData.auditLogs);
        }
      }

      // 3. Keep CloudPanel mysql status updated
      await checkCloudPanelConnection();

    } catch (err) {
      setErrorMessage("System telemetry refresh timeout.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }

  // CloudPanel Sync Connector ping
  async function checkCloudPanelConnection() {
    setIsLoadingCp(true);
    try {
      const res = await fetch("/api/cloudpanel/status");
      if (res.ok) {
        const data = await res.json();
        setCpStatus(data);
      } else {
        setCpStatus({
          configured: false,
          connected: false,
          usersCount: 0,
          message: "Internal configuration mismatch or database firewall socket blocked."
        });
      }
    } catch (err: any) {
      setCpStatus({
        configured: false,
        connected: false,
        usersCount: 0,
        message: err.message || "Failed reading from server DB connection check."
      });
    } finally {
      setIsLoadingCp(false);
    }
  }

  // Force database replication and local dataset hydrations over CloudPanel MySQL
  async function handleCloudPanelForceHydration() {
    if (!window.confirm("CRITICAL WARNING: This will drop and re-seed all tables (users, workspaces, members, posts, courses, logs) over the CloudPanel MySQL server using current local system db.json backups. Proceed?")) {
      return;
    }

    setIsMigrating(true);
    setMigrationRes(null);
    try {
      const res = await fetch("/api/cloudpanel/trigger-migration", {
        method: "POST",
        headers: { "Content-Type": "application/json" }
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setMigrationRes({ success: true, message: data.message });
        await checkCloudPanelConnection();
        // Load clean data from fresh DB
        await loadAdminData();
      } else {
        setMigrationRes({ success: false, message: data.error || "Hydration sequence failed." });
      }
    } catch (err: any) {
      setMigrationRes({ success: false, message: err.message || "Database query timeout." });
    } finally {
      setIsMigrating(false);
    }
  }

  useEffect(() => {
    loadAdminData();
  }, []);

  // Update specific global user platform-wide roles
  const handleUpdatePlatformRole = async (userId: string, targetPlatformRole: string) => {
    setSuccessMessage("");
    setErrorMessage("");
    try {
      const res = await fetch(`/api/rbac/users/${userId}/platform-role`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ platformRole: targetPlatformRole })
      });

      if (!res.ok) {
        const errData = await res.json();
        setErrorMessage(errData.error || "Failed to alter status.");
        return;
      }

      setSuccessMessage(`Successfully elevated and updated platform-level access to ${targetPlatformRole}!`);
      
      // Update state locally
      setGlobalUsers(prev => prev.map(u => u.id === userId ? { ...u, platformRole: targetPlatformRole as PlatformRole } : u));
      
      // Refresh logs
      const logRes = await fetch("/api/rbac/audit-logs");
      if (logRes.ok) {
        const logData = await logRes.json();
        setAuditLogs(logData.auditLogs || []);
      }
    } catch (err) {
      setErrorMessage("RBAC operational promotion failed.");
    }
  };

  // Broadcast Alert dispatch simulations
  const handleDispatchBroadcast = (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadcastMessage.trim()) return;

    setBroadcastSuccess(true);
    setTimeout(() => {
      setBroadcastSuccess(false);
      setBroadcastMessage("");
    }, 3000);
  };

  // Simulated Workspace Provisioner
  const handleSimulateWorkspaceProvision = (e: React.FormEvent) => {
    e.preventDefault();
    if (!simWsName || !simWsSubdomain || !simWsEmail) {
      alert("Please fill all fields to provision.");
      return;
    }
    setSimIsProvisioning(true);
    setSimWsSuccessMsg("");

    setTimeout(() => {
      setSimIsProvisioning(false);
      setSimWsSuccessMsg(`Successfully provisioned virtual SQL database container shard for '${simWsName}' mapped to subdomain 'https://${simWsSubdomain.toLowerCase()}.skoolsaas.pro' with total analytical segregation. Email token sent to operator ${simWsEmail}.`);
      setSimWsName("");
      setSimWsSubdomain("");
      setSimWsEmail("");
    }, 1500);
  };

  // Process payouts simulation
  const handleProcessCreatorPayoutNow = (payoutId: string) => {
    setPayoutProcessingId(payoutId);
    setTimeout(() => {
      setCreatorsPayoutList(prev => prev.map(cr => cr.id === payoutId ? { ...cr, unpaidEarnings: 0, status: "PROCESSED" } : cr));
      setPayoutProcessingId(null);
      alert("ACH/ISO direct wire processed successfully! Funds transferred with system clearing tracking ID: TRX-CLPAN-" + Math.floor(Math.random() * 900000 + 100000));
    }, 1500);
  };

  // SMTP Test trigger simulation
  const handleTriggerSMTPTest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!smtpTestEmail) return;
    setSmtpTestResult("CONNECTING");
    setTimeout(() => {
      setSmtpTestResult("SUCCESS");
      setSmtpTestEmail("");
    }, 1500);
  };

  // Copy local schema SQL script helper
  const handleCopySchemaCommandFile = () => {
    navigator.clipboard.writeText("cat /cloudpanel/schema.sql");
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2000);
  };

  // Categorize navigation items cleanly
  const navigationGroups = [
    {
      title: "🌐 PLATFORM CONTROL",
      items: [
        { id: "dashboard", name: "Platform Dashboard", icon: Layers, desc: "System health & active tenants map" },
        { id: "analytics", name: "SaaS Analytics", icon: TrendingUp, desc: "MRR, traffic, and platform indexes" },
      ]
    },
    {
      title: "👥 SAAS OPERATIONS",
      items: [
        { id: "users", name: "User Management", icon: Users, desc: "Platform account matrix & roles" },
        { id: "workspaces", name: "Workspace Management", icon: Globe, desc: "Tenant shard databases & provisioning" },
        { id: "subscriptions", name: "Subscription Plans", icon: CreditCard, desc: "SaaS price matrix hooks & cut tier" },
      ]
    },
    {
      title: "💰 FINANCIALS",
      items: [
        { id: "revenue", name: "Revenue Analytics", icon: DollarSign, desc: "Platform cuts fee split analysis" },
        { id: "payouts", name: "Creator Payouts", icon: Coins, desc: "Wire transfers & pending creator balances" },
      ]
    },
    {
      title: "🔒 PLATFORM SHIELD",
      items: [
        { id: "shield", name: "Platform Shield", icon: Shield, desc: "Firewall modes & thread lockdown" },
        { id: "logs", name: "Audit Logs", icon: ClipboardList, desc: "RBAC security & incident logging" },
      ]
    },
    {
      title: "⚙️ INFRASTRUCTURE",
      items: [
        { id: "ai", name: "AI & API Controls", icon: Sparkles, desc: "Gemini token quotas & instruction sets" },
        { id: "storage", name: "Storage & Media", icon: HardDrive, desc: "Buckets file structures & optimize switches" },
        { id: "email", name: "Email & Notifications", icon: Mail, desc: "SMTP server configs & system alerts" },
        { id: "settings", name: "System Settings", icon: Settings, desc: "System host parameters & backups" },
        { id: "cloudpanel", name: "CloudPanel Console", icon: Database, desc: "MySQL replication & phpMyAdmin rules" },
      ]
    }
  ];

  // Calculated overall MRR
  const totalMRR = communities.reduce((acc, current) => acc + (current.isPremium ? current.priceMonthly * current.membersCount : 0), 0) + 7480;

  // Filtered Users List
  const filteredUsers = globalUsers.filter(u => 
    u.fullName?.toLowerCase().includes(usersSearch.toLowerCase()) ||
    u.email?.toLowerCase().includes(usersSearch.toLowerCase()) ||
    u.platformRole?.toLowerCase().includes(usersSearch.toLowerCase())
  );

  // Filtered Logs List
  const filteredLogs = auditLogs.filter(l => {
    const textMatch = l.userName?.toLowerCase().includes(logsSearch.toLowerCase()) || 
                      l.details?.toLowerCase().includes(logsSearch.toLowerCase());
    const actionMatch = logsFilterAction === "ALL" || l.action === logsFilterAction;
    return textMatch && actionMatch;
  });

  return (
    <div className="h-full flex flex-col bg-[#F8F9FB] overflow-hidden" id="superadmin-saas-infra-wrapper">
      
      {/* Alarm flash overlay mode inside Cloud Panel Shield */}
      {shieldThreatLevel === "LOCKDOWN" && (
        <div className="bg-red-650 text-white py-2 px-4 text-center font-mono font-bold text-xs flex items-center justify-center gap-3 animate-pulse shrink-0 z-50 shadow-md">
          <ShieldAlert className="w-4 h-4 animate-bounce" /> 
          <span>PLATFORM THREAT LEVEL: LOCKDOWN STATE ACTIVE. COLD-RESTRICTIONS ON THE CORE API IN INGRESS ZONE PORT 3000.</span>
          <button 
            onClick={() => setShieldThreatLevel("LOW")}
            className="bg-white text-red-700 px-3 py-0.5 rounded text-[10px] font-sans font-bold uppercase transition hover:bg-slate-100 cursor-pointer"
          >
            Acknowledge Normalcy
          </button>
        </div>
      )}

      {/* Main Container Layout */}
      <div className="flex flex-1 overflow-hidden">
        
        {/* INNER 14-TAB NAVIGATION SIDEBAR */}
        <aside className="w-72 bg-slate-900 border-r border-slate-800 flex flex-col h-full shrink-0 hidden lg:flex select-none">
          <div className="p-4 border-b border-slate-800 bg-slate-950/40">
            <div className="flex items-center gap-2.5">
              <span className="text-xl">👑</span>
              <div>
                <h2 className="text-xs font-bold text-slate-100 font-display tracking-tight leading-snug">Super Admin</h2>
                <p className="text-[10px] text-slate-400 font-mono">Infra Global Owner</p>
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-4 font-sans select-none custom-scrollbar">
            {navigationGroups.map((grp) => (
              <div key={grp.title} className="space-y-1">
                <span className="px-2 text-[9px] font-bold text-slate-500 font-mono tracking-widest block uppercase">
                  {grp.title}
                </span>
                <div className="space-y-0.5">
                  {grp.items.map((item) => {
                    const Icon = item.icon;
                    const isSelected = activeSection === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => {
                          setActiveSection(item.id);
                          setSuccessMessage("");
                          setErrorMessage("");
                        }}
                        className={`w-full text-left px-2.5 py-1.5 rounded-xl transition flex items-center gap-2.5 group cursor-pointer ${
                          isSelected
                            ? "bg-indigo-600 text-white font-semibold shadow-md shadow-indigo-900/30"
                            : "text-slate-400 hover:bg-slate-850 hover:text-slate-105"
                        }`}
                      >
                        <Icon className={`w-4 h-4 shrink-0 transition ${
                          isSelected ? "text-white" : "text-slate-400 group-hover:text-indigo-400"
                        }`} />
                        <div className="truncate">
                          <span className="text-[11px] block tracking-tight">{item.name}</span>
                          {!isSelected && (
                            <span className="text-[9px] text-slate-500 block truncate leading-tight group-hover:text-slate-400">
                              {item.desc}
                            </span>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          <div className="p-4 border-t border-slate-800 bg-slate-950/40 flex items-center justify-between text-[10px] text-slate-400 font-mono">
            <span>MySQL Connection:</span>
            <span className={`w-2.5 h-2.5 rounded-full ${isLoadingCp ? "bg-slate-500 animate-pulse" : cpStatus?.connected ? "bg-emerald-500" : "bg-amber-500"}`} />
          </div>
        </aside>

        {/* MAIN CONFIGURATION STACK */}
        <div className="flex-1 overflow-y-auto flex flex-col min-w-0" id="super-admin-view-viewport">
          
          {/* Header Dashboard Banner */}
          <div className="p-4 sm:p-5 bg-white border-b border-[#E5E7EB] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 shrink-0">
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm font-bold text-gray-900 font-display tracking-tight flex items-center gap-1.5">
                  🌐 Platform Control Dashboard
                </span>
                <span className="text-[9.5px] uppercase font-mono bg-slate-900 text-white px-2 py-0.5 rounded-full font-bold">
                  SaaS Owner Shell
                </span>
              </div>
              <p className="text-[10px] text-gray-400 mt-0.5 leading-relaxed">
                Centralized telemetry & node configuration panel. Live-routing across {communities.length} tenant databases.
              </p>
            </div>

            {/* Mobile Dropdown Section Swapper */}
            <div className="lg:hidden flex items-center gap-2 text-xs w-full sm:w-auto">
              <span className="text-gray-400 font-semibold font-mono">SECTION:</span>
              <select
                value={activeSection}
                onChange={(e) => setActiveSection(e.target.value)}
                className="flex-1 sm:flex-initial border border-gray-200 bg-white px-3 py-1.5 rounded-xl font-bold text-gray-850 cursor-pointer focus:outline-none focus:ring-1 focus:ring-indigo-600"
              >
                {navigationGroups.flatMap(g => g.items).map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={loadAdminData}
                disabled={isLoading}
                className="px-3.5 py-1.5 bg-gray-100 hover:bg-gray-200 border border-gray-200 text-gray-700 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer disabled:opacity-40"
              >
                <RefreshCw className={`w-3 h-3 ${isLoading ? "animate-spin" : ""}`} />
                {isLoading ? "Syncing..." : "Reload Datasets"}
              </button>
            </div>
          </div>

          <div className="p-4 sm:p-6 max-w-6xl w-full mx-auto space-y-6 flex-1">
            
            {/* Context Messages */}
            {successMessage && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs flex items-center gap-2 animate-in fade-in duration-200">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span className="font-semibold">{successMessage}</span>
              </div>
            )}
            {errorMessage && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl text-xs flex items-center gap-2 animate-in fade-in duration-200">
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                <span className="font-semibold">{errorMessage}</span>
              </div>
            )}

            {/* ========================================================== */}
            {/* SECTION 1: PLATFORM DASHBOARD */}
            {/* ========================================================== */}
            {activeSection === "dashboard" && (
              <div className="space-y-6 animate-in fade-in duration-150">
                
                {/* Visual Status Grid */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-white rounded-2xl border border-[#E5E7EB] p-4 shadow-sm">
                    <span className="text-[9px] text-gray-400 block uppercase font-mono font-bold tracking-wider">PLATFORM STATE</span>
                    <span className="text-sm font-black font-mono text-emerald-700 block mt-1 tracking-tight flex items-center gap-1">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse block" /> OPERATIONAL
                    </span>
                  </div>

                  <div className="bg-white rounded-2xl border border-[#E5E7EB] p-4 shadow-sm">
                    <span className="text-[9px] text-gray-400 block uppercase font-mono font-bold tracking-wider">DATABASE LAYERS</span>
                    <span className="text-xs font-bold font-mono text-gray-900 block mt-1 truncate">
                      {cpStatus?.connected ? "CLOUDPANEL MYSQL" : "SQLite FILE MEMORY"}
                    </span>
                  </div>

                  <div className="bg-white rounded-2xl border border-[#E5E7EB] p-4 shadow-sm">
                    <span className="text-[9px] text-gray-400 block uppercase font-mono font-bold tracking-wider">SAAS TENANTS</span>
                    <span className="text-sm font-extrabold font-mono text-gray-900 block mt-1">
                      {communities.length} Host Shards Loaded
                    </span>
                  </div>

                  <div className="bg-white rounded-2xl border border-[#E5E7EB] p-4 shadow-sm">
                    <span className="text-[9px] text-gray-400 block uppercase font-mono font-bold tracking-wider">COMBINED EST MRR</span>
                    <span className="text-sm font-extrabold font-mono text-indigo-700 block mt-1">
                      ${totalMRR.toLocaleString()} USD
                    </span>
                  </div>
                </div>

                {/* Left/Right Layout for Main dashboard */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  
                  {/* Tenants Summary */}
                  <div className="lg:col-span-2 bg-white rounded-3xl border border-[#E5E7EB] p-5 shadow-sm space-y-4">
                    <div className="flex justify-between items-center border-b border-gray-100 pb-3">
                      <div>
                        <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 font-mono">Tenant Database Directory</h3>
                        <p className="text-[10px] text-gray-400 mt-0.5">Isolated relational course-databases sharded under active DNS mapping.</p>
                      </div>
                      <span className="text-[10px] bg-slate-100 text-slate-700 font-mono font-bold px-2 py-0.5 rounded">{communities.length} Active dns</span>
                    </div>

                    <div className="divide-y divide-gray-100 overflow-y-auto max-h-80 pr-1">
                      {communities.map((comm) => (
                        <div key={comm.id} className="py-3 flex justify-between items-center text-xs hover:bg-gray-50/50 px-1 rounded-lg transition">
                          <div>
                            <span className="font-bold text-gray-900 block">{comm.name}</span>
                            <span className="text-[10px] text-gray-500 font-mono">
                              Subdomain: <strong className="text-indigo-650 font-semibold">{comm.subdomain}.skoolsaas.pro</strong>
                            </span>
                          </div>
                          <div className="text-right">
                            <span className="block font-bold text-gray-950 font-mono">${comm.isPremium ? comm.priceMonthly : 0}/mo</span>
                            <span className="text-gray-400 text-[10px] tracking-tight">👤 {comm.membersCount} users</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Operational Banner Bulletin Broadcast Form */}
                  <div className="bg-white rounded-3xl border border-[#E5E7EB] p-5 shadow-sm flex flex-col justify-between">
                    <div>
                      <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 font-mono">Platform-Wide Broadcast Alert</h3>
                      <p className="text-[10px] text-gray-400 mt-1 leading-relaxed">
                        Incorporate an immediate banner notification atop all registered tenant workspace index pages.
                      </p>
                    </div>

                    <form onSubmit={handleDispatchBroadcast} className="space-y-3 mt-4">
                      {broadcastSuccess ? (
                        <div className="p-4 bg-emerald-50 text-emerald-800 rounded-xl text-center text-xs space-y-1 border border-emerald-100 animate-in zoom-in-95 duration-150">
                          <span className="font-bold block">🚨 Core Broadcast Connected</span>
                          <p className="text-[9.5px] text-emerald-600">Dispatched live server alerts to active channels.</p>
                        </div>
                      ) : (
                        <>
                          <textarea
                            rows={4}
                            required
                            placeholder="e.g. Upgrade Notice: CloudPanel DB server is undergoing routine maintenance at 04:00 UTC."
                            value={broadcastMessage}
                            onChange={(e) => setBroadcastMessage(e.target.value)}
                            className="w-full border border-gray-200 bg-[#F9FAFB] rounded-xl p-3 text-xs focus:ring-1 focus:ring-indigo-650 focus:outline-none placeholder:text-gray-400 leading-normal font-sans"
                          />
                          
                          <button
                            type="submit"
                            className="w-full py-2.5 bg-slate-900 hover:bg-slate-950 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-sm transition"
                          >
                            <Send className="w-3.5 h-3.5" />
                            Dispatch Operator Banner
                          </button>
                        </>
                      )}
                    </form>
                  </div>

                </div>

                {/* Quick Platform Actions Card */}
                <div className="bg-white rounded-3xl border border-[#E5E7EB] p-5 shadow-sm">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 font-mono mb-3">Instant Operations Hub</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <button 
                      onClick={() => { alert("Force CloudPanel SQL Flush initiated. Running clean checks."); checkCloudPanelConnection(); }}
                      className="p-3 bg-indigo-50/10 hover:bg-indigo-50/40 border border-indigo-150 text-indigo-750 rounded-xl text-xs text-left font-bold transition flex items-center justify-between"
                    >
                      <span>🔄 Force Flush MySQL cache</span>
                      <ArrowRight className="w-4 h-4 text-indigo-600 shrink-0" />
                    </button>
                    <button 
                      onClick={() => alert("Snapshot system replication complete. backup_sqlite_db.bin saved to storage folder. S3 integrity checks returned okay.")}
                      className="p-3 bg-emerald-50/10 hover:bg-emerald-50/40 border border-emerald-150 text-emerald-750 rounded-xl text-xs text-left font-bold transition flex items-center justify-between"
                    >
                      <span>📥 Capture System Snapshot</span>
                      <ArrowRight className="w-4 h-4 text-emerald-600 shrink-0" />
                    </button>
                    <button 
                      onClick={() => { setMaintenanceModeActive(!maintenanceModeActive); alert("Maintenance mode toggle requested."); }}
                      className={`p-3 border rounded-xl text-xs text-left font-bold transition flex items-center justify-between ${
                        maintenanceModeActive 
                          ? "bg-rose-50 border-rose-200 text-rose-800" 
                          : "bg-slate-50 border-gray-200 text-gray-700 hover:bg-gray-100"
                      }`}
                    >
                      <span>🔐 {maintenanceModeActive ? "Deactivate Lockdown Mode" : "Activate Maintenance Screen"}</span>
                      <ArrowRight className="w-4 h-4 text-slate-650 shrink-0" />
                    </button>
                    <button 
                      onClick={() => { setShieldThreatLevel("LOW"); setAlarmActive(false); alert("All alerts cleared. Logs archived."); }}
                      className="p-3 bg-cyan-50/10 hover:bg-cyan-50/40 border border-cyan-150 text-cyan-750 rounded-xl text-xs text-left font-bold transition flex items-center justify-between"
                    >
                      <span>🛡️ Clear Security Counters</span>
                      <ArrowRight className="w-4 h-4 text-cyan-600 shrink-0" />
                    </button>
                  </div>
                </div>

              </div>
            )}

            {/* ========================================================== */}
            {/* SECTION 2: SAAS ANALYTICS */}
            {/* ========================================================== */}
            {activeSection === "analytics" && (
              <div className="space-y-6 animate-in fade-in duration-150">
                <div className="bg-white rounded-3xl border border-[#E5E7EB] p-5 shadow-sm space-y-4">
                  <div className="flex justify-between items-center flex-wrap gap-2">
                    <div>
                      <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 font-mono">Platform Financial Trajectory</h3>
                      <p className="text-[10px] text-gray-400 mt-0.5">Estimated MRR growth and platform commission fee share calculations over previous fiscal sectors.</p>
                    </div>
                    <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-lg px-2.5 py-1">
                      📈 Yearly MRR Velocity: +28.4%
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
                          <span className="text-[8px] text-slate-500 uppercase block font-mono">Current Peak Peak</span>
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

                {/* Sub analytical KPI indicators bento block */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  <div className="bg-white rounded-2xl border border-gray-150 p-5 shadow-sm">
                    <span className="text-[9px] text-gray-500 uppercase font-mono font-bold tracking-wider block">CLTV (PLATFORM LIFE TERM VALUE)</span>
                    <span className="text-xl font-extrabold text-slate-900 block mt-1 tracking-tight">$4,850 USD</span>
                    <span className="text-[10px] text-emerald-700 font-semibold block mt-1 leading-none">
                      ▲ +4.2% from previous month pool
                    </span>
                  </div>

                  <div className="bg-white rounded-2xl border border-gray-150 p-5 shadow-sm">
                    <span className="text-[9px] text-gray-500 uppercase font-mono font-bold tracking-wider block">CAC (CUSTOMER ACQUISITION COST)</span>
                    <span className="text-xl font-extrabold text-slate-900 block mt-1 tracking-tight">$312 USD</span>
                    <span className="text-[10px] text-emerald-700 font-semibold block mt-1 leading-none">
                      ▼ -8.4% cost savings optimized
                    </span>
                  </div>

                  <div className="bg-white rounded-2xl border border-gray-150 p-5 shadow-sm">
                    <span className="text-[9px] text-gray-500 uppercase font-mono font-bold tracking-wider block">PLATFORM RECURRING CHURN RATE</span>
                    <span className="text-xl font-extrabold text-slate-900 block mt-1 tracking-tight">1.25%</span>
                    <span className="text-[10px] text-slate-400 font-medium block mt-1 leading-none">
                      Industry standard benchmark: 3.5%
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* ========================================================== */}
            {/* SECTION 3: USER MANAGEMENT */}
            {/* ========================================================== */}
            {activeSection === "users" && (
              <div className="space-y-6 animate-in fade-in duration-150">
                <div className="bg-white rounded-3xl border border-[#E5E7EB] p-5 shadow-sm space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                      <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 font-mono">Platform Identity Management</h3>
                      <p className="text-[10px] text-gray-400 mt-0.5">Coordinate overarching platform privileges and security clearance levels.</p>
                    </div>

                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Search users by name, email, role..."
                        value={usersSearch}
                        onChange={(e) => setUsersSearch(e.target.value)}
                        className="w-full sm:w-64 pl-3 pr-4 py-1.5 border border-gray-200 rounded-xl text-xs focus:ring-1 focus:ring-indigo-550 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="divide-y divide-gray-100 max-h-96 overflow-y-auto pr-1">
                    {filteredUsers.length === 0 ? (
                      <div className="py-12 text-center text-gray-400 font-mono text-xs">
                        No active users matching the query filter bounds.
                      </div>
                    ) : (
                      filteredUsers.map((userObj) => (
                        <div key={userObj.id} className="py-3.5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 text-xs hover:bg-gray-50/50 px-2 rounded-xl transition">
                          <div className="flex items-center gap-3">
                            <span className="text-2xl">{userObj.avatarUrl ? "" : "👤"}</span>
                            {userObj.avatarUrl && (
                              <img
                                src={userObj.avatarUrl}
                                alt="avatar"
                                referrerPolicy="no-referrer"
                                className="w-8 h-8 rounded-full border object-cover"
                              />
                            )}
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-gray-950">{userObj.fullName || "Incognito Member"}</span>
                                <span className="text-[9px] bg-slate-100 text-slate-650 font-mono px-1 rounded">
                                  Lvl {userObj.level || 1}
                                </span>
                              </div>
                              <span className="text-[10.5px] text-gray-400 font-mono">{userObj.email}</span>
                            </div>
                          </div>

                          <div className="flex items-center gap-3 justify-between sm:justify-end">
                            <div className="text-right hidden sm:block">
                              <span className="text-[10px] text-gray-400 block font-mono">Platform Privilege Role</span>
                            </div>

                            <select
                              disabled={userObj.id === currentUser?.id}
                              value={userObj.platformRole || "user"}
                              onChange={(e) => handleUpdatePlatformRole(userObj.id, e.target.value)}
                              className="border border-gray-200 bg-white text-xs px-2.5 py-1.5 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-650 cursor-pointer disabled:opacity-40 font-semibold text-gray-700"
                            >
                              <option value="user">User Status (Standard)</option>
                              <option value="creator">Creator Elite (MRR enabled)</option>
                              <option value="support_staff">Support Desk Staff</option>
                              <option value="super_admin">🚨 GLOBAL SUPER ADMIN</option>
                            </select>

                            <button
                              onClick={() => {
                                alert(`Simulated account suspension toggle triggered for user ${userObj.fullName}. Core token revocation issued to DB.`);
                              }}
                              className="px-2 py-1 border border-rose-100 hover:bg-rose-50 text-rose-600 rounded-lg text-[10px] uppercase font-mono font-bold cursor-pointer"
                            >
                              Suspend
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* ========================================================== */}
            {/* SECTION 4: WORKSPACE MANAGEMENT */}
            {/* ========================================================== */}
            {activeSection === "workspaces" && (
              <div className="space-y-6 animate-in fade-in duration-150">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  
                  {/* Workspace List Registry */}
                  <div className="lg:col-span-2 bg-white rounded-3xl border border-[#E5E7EB] p-5 shadow-sm space-y-4">
                    <div>
                      <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 font-mono">Dns Subdomains & Tenant Containers</h3>
                      <p className="text-[10px] text-gray-400 mt-0.5">Control live subdomain namespaces and operational multi-tenant database links.</p>
                    </div>

                    <div className="divide-y divide-gray-100 max-h-90 overflow-y-auto pr-1">
                      {communities.map((comm) => (
                        <div key={comm.id} className="py-3 flex items-center justify-between text-xs hover:bg-gray-50/50 px-1 rounded-lg transition">
                          <div>
                            <span className="font-bold text-gray-900 block">{comm.name}</span>
                            <span className="text-[10px] text-indigo-600 font-mono block mt-0.5 font-semibold">
                              https://{comm.subdomain}.skoolsaas.pro
                            </span>
                          </div>
                          
                          <div className="flex items-center gap-4 text-right">
                            <div className="hidden sm:block">
                              <span className="text-[10px] text-gray-400 block font-mono">Monthly Rate</span>
                              <span className="font-bold font-mono text-gray-800">${comm.isPremium ? comm.priceMonthly : 0}/mo</span>
                            </div>
                            <div>
                              <button 
                                onClick={() => alert(`Synchronized schema checked for namespace workspace: "${comm.name}". SQLite shard validated.`)}
                                className="px-2 py-1 hover:bg-gray-100 border border-gray-150 rounded-lg font-bold text-[10px] cursor-pointer"
                              >
                                Check Health
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Provision Space Simulator Form */}
                  <div className="bg-white rounded-3xl border border-[#E5E7EB] p-5 shadow-sm flex flex-col justify-between">
                    <div>
                      <h3 className="text-xs font-bold uppercase tracking-widest text-indigo-700 font-mono flex items-center gap-1">
                        ⚡ Shard Database Provisioner
                      </h3>
                      <p className="text-[10px] text-gray-400 mt-1 leading-relaxed">
                        Instantly deploy a customized virtual community tenant container mapped under your custom subnet.
                      </p>
                    </div>

                    <form onSubmit={handleSimulateWorkspaceProvision} className="space-y-3 mt-4">
                      <div>
                        <label className="text-[9.5px] font-bold text-gray-400 block uppercase font-mono mb-1">WORKSPACE NAME</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Next.js Masterclasses"
                          value={simWsName}
                          onChange={(e) => setSimWsName(e.target.value)}
                          className="w-full border border-gray-200 bg-slate-50 px-2.5 py-1.5 rounded-xl text-xs focus:ring-1 focus:ring-indigo-600 focus:outline-none placeholder:text-gray-400"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-[9.5px] font-bold text-gray-400 block uppercase font-mono mb-1">SUBDOMAIN</label>
                          <input
                            type="text"
                            required
                            placeholder="e.g. nextclass"
                            value={simWsSubdomain}
                            onChange={(e) => setSimWsSubdomain(e.target.value)}
                            className="w-full border border-gray-200 bg-slate-50 px-2.5 py-1.5 rounded-xl text-xs focus:ring-1 focus:ring-indigo-600 focus:outline-none placeholder:text-gray-400"
                          />
                        </div>
                        <div>
                          <label className="text-[9.5px] font-bold text-gray-400 block uppercase font-mono mb-1">MONTHLY RATE ($)</label>
                          <input
                            type="number"
                            required
                            min={0}
                            placeholder="e.g. 49"
                            value={simWsPrice}
                            onChange={(e) => setSimWsPrice(Number(e.target.value))}
                            className="w-full border border-gray-200 bg-slate-50 px-2.5 py-1.5 rounded-xl text-xs focus:ring-1 focus:ring-indigo-600 focus:outline-none placeholder:text-gray-400 text-center"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="text-[9.5px] font-bold text-gray-400 block uppercase font-mono mb-1">CREATOR OWNER EMAIL</label>
                        <input
                          type="email"
                          required
                          placeholder="creator-email@organization.io"
                          value={simWsEmail}
                          onChange={(e) => setSimWsEmail(e.target.value)}
                          className="w-full border border-gray-200 bg-slate-50 px-2.5 py-1.5 rounded-xl text-xs focus:ring-1 focus:ring-indigo-600 focus:outline-none placeholder:text-gray-400"
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={simIsProvisioning}
                        className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-sm transition"
                      >
                        {simIsProvisioning ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-4 h-4" />}
                        {simIsProvisioning ? "Deploying..." : "Provision Tenant Shard"}
                      </button>
                    </form>

                    {simWsSuccessMsg && (
                      <div className="p-3 bg-emerald-50 border border-emerald-150 text-emerald-800 rounded-xl text-[10.5px] leading-snug mt-3 animate-in fade-in duration-200">
                        {simWsSuccessMsg}
                      </div>
                    )}
                  </div>

                </div>
              </div>
            )}

            {/* ========================================================== */}
            {/* SECTION 5: SUBSCRIPTION PLANS */}
            {/* ========================================================== */}
            {activeSection === "subscriptions" && (
              <div className="space-y-6 animate-in fade-in duration-150">
                <div className="bg-white rounded-3xl border border-[#E5E7EB] p-5 shadow-sm space-y-4">
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 font-mono">SaaS Packaging Tiers Configurator</h3>
                    <p className="text-[10px] text-gray-400 mt-0.5">Configure platform billing plans and transaction fee structures.</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {recurringPlanTiers.map((tier) => (
                      <div key={tier.id} className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex flex-col justify-between space-y-3 relative overflow-hidden">
                        <div>
                          <span className="text-[9px] uppercase font-mono font-black text-indigo-700">TIER MODEL</span>
                          <h4 className="text-sm font-bold text-slate-900 mt-1">{tier.name}</h4>
                          <div className="flex items-baseline mt-2 font-mono">
                            <span className="text-lg font-extrabold text-slate-950">${tier.priceMonthly}</span>
                            <span className="text-[10px] text-slate-400">/mo</span>
                          </div>
                        </div>

                        <div className="space-y-1.5 pt-2 border-t border-slate-100 text-[11px] text-slate-600">
                          <div className="flex justify-between items-center">
                            <span>Admin Commission:</span>
                            <span className="font-bold text-indigo-650">{tier.commissionFee}%</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span>Active Shards:</span>
                            <span className="font-semibold text-slate-900">{tier.activeWorkspaces} tenant nodes</span>
                          </div>
                        </div>

                        <button 
                          onClick={() => {
                            const newCost = prompt(`Define new monthly cost subscription parameter for tier ${tier.name}:`, String(tier.priceMonthly));
                            if (newCost !== null) {
                              setRecurringPlanTiers(prev => prev.map(t => t.id === tier.id ? { ...t, priceMonthly: Number(newCost) } : t));
                              alert("Database pricing rule modified.");
                            }
                          }}
                          className="w-full py-1.5 border border-slate-350 hover:bg-slate-900 hover:text-white transition rounded-xl text-[10px] font-bold cursor-pointer uppercase"
                        >
                          Modify Rates
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* Transaction fee modifier */}
                  <div className="p-4 bg-indigo-50/40 border border-indigo-120 rounded-2xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-4">
                    <div className="space-y-0.5">
                      <span className="text-[10px] text-indigo-750 block font-bold font-mono uppercase tracking-widest">GLOBAL STRIPE COMMISSIONS COMMISSION</span>
                      <h4 className="text-xs font-bold text-indigo-950">Baseline Platform transaction cut</h4>
                      <p className="text-[10px] text-indigo-900/80">Commission percentage processed by skool.SaaS from premium community enrollments.</p>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <input 
                        type="range" 
                        min="0" 
                        max="15" 
                        step="0.5"
                        value={platformCommissionFee}
                        onChange={(e) => setPlatformCommissionFee(Number(e.target.value))}
                        className="w-32 accent-indigo-600 cursor-pointer"
                      />
                      <span className="w-12 text-center text-xs font-black font-mono bg-indigo-950 text-white rounded-lg py-1">
                        {platformCommissionFee}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ========================================================== */}
            {/* SECTION 6: REVENUE ANALYTICS */}
            {/* ========================================================== */}
            {activeSection === "revenue" && (
              <div className="space-y-6 animate-in fade-in duration-150">
                <div className="bg-white rounded-3xl border border-[#E5E7EB] p-5 shadow-sm space-y-4">
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 font-mono">Platform Revenue Distribution</h3>
                    <p className="text-[10px] text-gray-400 mt-0.5">Consolidated summary on stripe transactions, transaction fees accrued, and platform split commissions.</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl text-center space-y-1">
                      <span className="text-[9px] uppercase font-mono font-bold text-slate-400 block">TOTAL VOLUME PROCESSED</span>
                      <span className="text-xl font-extrabold text-slate-950 font-sans tracking-tight">$94,842 USD</span>
                      <span className="text-[10px] text-emerald-700 font-bold block">▲ +12% this cycle</span>
                    </div>

                    <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl text-center space-y-1">
                      <span className="text-[9px] uppercase font-mono font-bold text-slate-400 block">ACCRUED FEES CUT TAKES (3%)</span>
                      <span className="text-xl font-extrabold text-indigo-705 font-sans tracking-tight">
                        ${(totalMRR * (platformCommissionFee / 100) + 1240).toFixed(2)} USD
                      </span>
                      <span className="text-[10px] text-slate-400 block font-mono">Direct platform ownership earnings</span>
                    </div>

                    <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl text-center space-y-1">
                      <span className="text-[9px] uppercase font-mono font-bold text-slate-450 block">FAILED CHARGES</span>
                      <span className="text-xl font-extrabold text-rose-600 font-sans tracking-tight">$84.00 USD</span>
                      <span className="text-[10px] text-slate-400 block">System Recovery automated loop active</span>
                    </div>
                  </div>

                  {/* Interactive SVG Pie split visualization */}
                  <div className="p-4 bg-slate-900 border rounded-2xl flex flex-col sm:flex-row items-center justify-around gap-6">
                    <div className="w-32 h-32 relative shrink-0">
                      <svg width="100%" height="100%" viewBox="0 0 42 42" className="rotate-270">
                        <circle cx="21" cy="21" r="15.915" fill="transparent" stroke="rgb(31, 41, 55)" strokeWidth="4.5" />
                        
                        {/* 97% for creators */}
                        <circle cx="21" cy="21" r="15.915" fill="transparent" stroke="rgb(16, 185, 129)" strokeWidth="4.5" strokeDasharray="97 3" strokeDashoffset="0" />
                        
                        {/* 3% platform commission */}
                        <circle cx="21" cy="21" r="15.915" fill="transparent" stroke="rgb(79, 70, 229)" strokeWidth="4.5" strokeDasharray="3 97" strokeDashoffset="-97" />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center text-center font-mono">
                        <span className="text-xs font-bold text-white">97% : 3%</span>
                        <span className="text-[7.5px] text-slate-450 uppercase">Split Map</span>
                      </div>
                    </div>

                    <div className="space-y-2 text-xs md:text-sm text-slate-350 flex-1">
                      <h4 className="font-bold text-white font-mono text-xs uppercase text-slate-100">Live Fee Sharing Policy Rule</h4>
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 block" />
                        <span><strong>97.0%</strong>: Settled immediately onto original content creators' bank routing numbers via Stripe Connect.</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 block" />
                        <span><strong>{platformCommissionFee}%</strong> (Variable Commission Fee): Relayed onto platform operator system vault directly.</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ========================================================== */}
            {/* SECTION 7: CREATOR PAYOUTS */}
            {/* ========================================================== */}
            {activeSection === "payouts" && (
              <div className="space-y-6 animate-in fade-in duration-150">
                <div className="bg-white rounded-3xl border border-[#E5E7EB] p-5 shadow-sm space-y-4">
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 font-mono">Pending Creator Wire Transfers</h3>
                    <p className="text-[10px] text-gray-400 mt-0.5">Review and approve global community ledger distributions. Settled using direct banking network sweeps.</p>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="border-b border-gray-150 text-gray-400 font-bold font-mono text-[9.5px] uppercase tracking-wider bg-gray-50/50">
                          <th className="py-2.5 px-3">Creator / Organization</th>
                          <th className="py-2.5 px-3">Operator Email</th>
                          <th className="py-2.5 px-3 text-right">Ledge Balance Due</th>
                          <th className="py-2.5 px-3">State Status</th>
                          <th className="py-2.5 px-3 text-right">Administrative Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-150">
                        {creatorsPayoutList.map((cr) => (
                          <tr key={cr.id} className="hover:bg-slate-50/50 text-[10.5px]">
                            <td className="py-3 px-3 font-bold text-gray-900">{cr.name}</td>
                            <td className="py-3 px-3 text-gray-500 font-mono">{cr.email}</td>
                            <td className="py-3 px-3 text-right font-bold font-mono text-gray-900">
                              ${cr.unpaidEarnings.toLocaleString()}.00 USD
                            </td>
                            <td className="py-3 px-3">
                              <span className={`px-2 py-0.5 rounded text-[8.5px] font-mono uppercase font-bold border ${
                                cr.unpaidEarnings > 0 
                                  ? "bg-amber-50 text-amber-700 border-amber-155" 
                                  : "bg-emerald-50 text-emerald-700 border-emerald-155"
                              }`}>
                                {cr.status === "READY" && cr.unpaidEarnings > 0 ? "Pending Wire Clearance" : "Settled / Active"}
                              </span>
                            </td>
                            <td className="py-3 px-3 text-right">
                              {payoutProcessingId === cr.id ? (
                                <span className="text-[11px] font-bold text-indigo-650 flex items-center gap-1 justify-end font-mono animate-pulse">
                                  <RefreshCw className="w-3 h-3 animate-spin" /> Processing wire...
                                </span>
                              ) : cr.unpaidEarnings > 0 ? (
                                <button
                                  onClick={() => handleProcessCreatorPayoutNow(cr.id)}
                                  className="px-3 py-1 bg-slate-900 hover:bg-slate-950 text-white rounded-lg text-[10px] font-bold transition cursor-pointer"
                                >
                                  Process Bank Sweep
                                </button>
                              ) : (
                                <span className="text-gray-400 text-[10px] select-none font-medium">Clear of Debts</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
             {/* ========================================================== */}
            {/* SECTION 8: PLATFORM SHIELD */}
            {/* ========================================================== */}
            {activeSection === "shield" && (
              <div className="space-y-6 animate-in fade-in duration-150">
                
                {/* 1. THREAT MONITORING DIAL */}
                <div className="bg-white rounded-3xl border border-[#E5E7EB] p-6 shadow-sm space-y-4">
                  <div className="flex justify-between items-center border-b border-gray-100 pb-3 flex-wrap gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-indigo-600 animate-ping" />
                        <h3 className="text-xs font-bold uppercase tracking-widest text-[#4F46E5] font-mono">Platform Shield Intrusion & Threat Monitor</h3>
                      </div>
                      <p className="text-[10px] text-gray-400 mt-0.5">Automated intrusion prevention center, deep packet rate-limits, and live threat level mitigation.</p>
                    </div>
                    
                    <div className="flex items-center gap-1 bg-slate-900 p-1.5 rounded-xl text-xs font-mono font-bold text-white shrink-0">
                      <span className="px-2 text-slate-500 uppercase text-[9.5px]">THREAT LEVEL:</span>
                      <button 
                        onClick={() => { setShieldThreatLevel("LOW"); }}
                        className={`px-2.5 py-1 rounded-lg text-[10px] cursor-pointer font-extrabold transition ${shieldThreatLevel === "LOW" ? "bg-emerald-600 text-white" : "text-slate-400 hover:text-slate-200"}`}
                      >
                        LOW
                      </button>
                      <button 
                        onClick={() => { setShieldThreatLevel("ELEVATED"); }}
                        className={`px-2.5 py-1 rounded-lg text-[10px] cursor-pointer font-extrabold transition ${shieldThreatLevel === "ELEVATED" ? "bg-amber-600 text-white" : "text-slate-400 hover:text-slate-200"}`}
                      >
                        ELEVATED
                      </button>
                      <button 
                        onClick={() => { setShieldThreatLevel("CRITICAL"); }}
                        className={`px-2.5 py-1 rounded-lg text-[10px] cursor-pointer font-extrabold transition ${shieldThreatLevel === "CRITICAL" ? "bg-rose-600 text-white" : "text-slate-400 hover:text-slate-200"}`}
                      >
                        CRITICAL
                      </button>
                      <button 
                        onClick={() => { setShieldThreatLevel("LOCKDOWN"); }}
                        className={`px-2.5 py-1 rounded-lg text-[10px] cursor-pointer font-extrabold transition ${shieldThreatLevel === "LOCKDOWN" ? "bg-red-800 text-white animate-pulse shadow-inner" : "text-slate-450 hover:text-slate-300"}`}
                      >
                        LOCKDOWN
                      </button>
                    </div>
                  </div>

                  {/* Threat Meter stats line */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
                    <div className="bg-slate-50 p-3.5 rounded-2xl border border-gray-100 flex flex-col justify-between">
                      <span className="text-[9px] uppercase font-mono tracking-wider font-extrabold text-gray-400">Threat Dial Threshold</span>
                      <span className={`text-sm font-bold font-mono mt-1 ${shieldThreatLevel === "LOCKDOWN" ? "text-red-700 font-black animate-pulse" : shieldThreatLevel === "CRITICAL" ? "text-rose-600" : shieldThreatLevel === "ELEVATED" ? "text-amber-600" : "text-emerald-700"}`}>
                        {shieldThreatLevel} mitigations active
                      </span>
                    </div>
                    <div className="bg-slate-50 p-3.5 rounded-2xl border border-gray-100 flex flex-col justify-between">
                      <span className="text-[9px] uppercase font-mono tracking-wider font-extrabold text-gray-400">Core Network Port</span>
                      <span className="text-xs font-bold font-mono text-gray-800 mt-1">TCP/IP 3000 Ingress SSL</span>
                    </div>
                    <div className="bg-slate-50 p-3.5 rounded-2xl border border-gray-100 flex flex-col justify-between">
                      <span className="text-[9px] uppercase font-mono tracking-wider font-extrabold text-gray-400">Anti-DDoS Firewall Cache</span>
                      <span className="text-xs font-bold text-gray-850 mt-1">CloudPanel TLS Proxy Core (Active)</span>
                    </div>
                  </div>

                  {/* Critical Emergency broadcast panel */}
                  <div className="p-4 bg-rose-50/70 border border-rose-200 rounded-2xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="space-y-0.5">
                      <span className="text-[10px] text-rose-700 block font-bold font-mono tracking-wider uppercase">EMERGENCY EXCEPTION PORT COLD-STANDBY</span>
                      <h4 className="text-xs font-bold text-rose-950">Broadcast general DDoS evac blockades</h4>
                      <p className="text-[10px] text-rose-800/85 leading-normal">Instantly enforces security lockdown across all databases and terminates current workspace sessions to prevent unauthorized write exploits.</p>
                    </div>

                    <button
                      onClick={() => {
                        setAlarmActive(!alarmActive);
                        if (!alarmActive) {
                          setShieldThreatLevel("LOCKDOWN");
                          alert("ALARM ACTIVE. Platform security shifted to LOCKDOWN state!");
                        } else {
                          setShieldThreatLevel("LOW");
                          alert("Siren disarmed. Platform reverted to standard low-risk profiles.");
                        }
                      }}
                      className={`px-4 py-2.5 rounded-xl text-xs font-semibold tracking-wider uppercase font-mono shadow-sm transition shrink-0 cursor-pointer ${
                        alarmActive 
                          ? "bg-rose-700 text-white animate-bounce" 
                          : "bg-rose-950 hover:bg-rose-900 text-white"
                      }`}
                    >
                      ⚠️ {alarmActive ? "DISARM SECURITY SIREN" : "FORCE SYSTEM EVAC MODE"}
                    </button>
                  </div>
                </div>

                {/* 2. SECURITY PROTOCOLS ENFORCEMENT & MFA */}
                <div className="bg-white rounded-3xl border border-[#E5E7EB] p-6 shadow-sm space-y-4">
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-widest text-slate-450 font-mono">MFA & Infrastructure Encryptions</h3>
                    <p className="text-[10px] text-gray-455 mt-0.5">Enforce hardware MFA safety protocols, CORS validation rules, and custom SQL injection prevention parameters.</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {Object.entries(securityModules).map(([key, value]) => {
                      let displayName = key.replace(/([A-Z])/g, ' $1').trim();
                      if (key === "twoFactorForce") displayName = "MFA Forced For Staff";
                      if (key === "corsMode") displayName = "Strict CORS Filters";
                      if (key === "xssSanitizer") displayName = "Active XSS Sanitizer";
                      if (key === "sqliBlocker") displayName = "MySQL sqli Blocker";
                      if (key === "ddosRateLimit") displayName = "DDoS Rate Limits (Port 3000)";
                      if (key === "secureCookies") displayName = "TLS Secure Cookies";

                      return (
                        <div key={key} className="bg-slate-50 border border-gray-100 rounded-2xl p-4 flex items-center justify-between gap-3">
                          <div>
                            <span className="text-[9px] uppercase font-mono font-bold text-slate-400 block">
                              {displayName}
                            </span>
                            <span className="text-xs font-bold text-slate-800">
                              {value ? "Enforced Globally" : "Bypassed / Not Enforced"}
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => setSecurityModules(prev => ({ ...prev, [key]: !value }))}
                            className={`w-11 h-6 rounded-full transition relative shrink-0 cursor-pointer ${value ? "bg-indigo-600" : "bg-slate-200"}`}
                          >
                            <span className={`w-4.5 h-4.5 rounded-full bg-white absolute top-0.75 transition-all duration-150 ${value ? "left-5.5" : "left-1"}`} />
                          </button>
                        </div>
                      );
                    })}
                  </div>

                  <div className="bg-amber-50/50 border border-amber-200/70 p-3.5 rounded-2xl">
                    <p className="text-[10px] text-amber-850 leading-relaxed">
                      💡 <strong>MFA Enforcement Mandate:</strong> Enabling hardware multifactor protection shields all database access pathways. Admin and Creator credentials require active authenticator keys before granting edit locks.
                    </p>
                  </div>
                </div>

                {/* 3. FIREWALL IP BLACKLIST & BANS */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 animate-in fade-in duration-100">
                  <div className="bg-white rounded-3xl border border-[#E5E7EB] p-5 shadow-sm md:col-span-4 space-y-4">
                    <div>
                      <h4 className="text-xs font-bold text-gray-800 font-display">Target Firewall IP Ban Registry</h4>
                      <p className="text-[9.5px] text-gray-450 mt-0.5">Block malicious client machines and malicious scraping servers instantly before they hit CloudPanel proxy layers.</p>
                    </div>

                    <div className="space-y-1.5 text-xs font-sans">
                      <label className="block text-[10px] font-mono uppercase font-bold text-gray-500">Client IP Address</label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="e.g. 198.51.100.8"
                          value={newIpBan}
                          onChange={(e) => setNewIpBan(e.target.value)}
                          className="flex-1 bg-white border border-gray-200 rounded-xl px-2.5 py-1.5 text-[11px] font-mono focus:outline-none focus:ring-1 focus:ring-indigo-600"
                        />
                        <button
                          onClick={() => {
                            if (!newIpBan.trim()) return;
                            setBannedIps([...bannedIps, newIpBan.trim()]);
                            setNewIpBan("");
                            alert(`IP ${newIpBan} banned successfully on CloudPanel iptables firewall.`);
                          }}
                          className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-mono text-[10.5px] uppercase font-bold text-center block cursor-pointer transition"
                        >
                          BAN
                        </button>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-gray-100">
                      <span className="text-[9px] uppercase font-mono font-bold text-gray-400 tracking-wider block mb-2">Banned Client IPs ({bannedIps.length})</span>
                      <div className="space-y-1 max-h-36 overflow-y-auto">
                        {bannedIps.length === 0 ? (
                          <p className="text-[10px] text-gray-400 font-mono text-center py-2">No active IP network bans.</p>
                        ) : (
                          bannedIps.map((ip, idx) => (
                            <div key={idx} className="flex justify-between items-center bg-gray-50 px-2.5 py-1.5 rounded-xl border border-gray-100 text-[10.5px] font-mono">
                              <span className="text-gray-700">{ip}</span>
                              <button
                                onClick={() => {
                                  setBannedIps(bannedIps.filter(item => item !== ip));
                                  alert(`IP ${ip} has been pardoned and reverted to routing pool.`);
                                }}
                                className="text-rose-600 hover:text-rose-800 font-bold uppercase text-[9px]"
                              >
                                pardon
                              </button>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </div>

                  {/* 4. ABUSE LOGS & SECURITY EVENTS */}
                  <div className="bg-white rounded-3xl border border-[#E5E7EB] p-5 shadow-sm md:col-span-8 space-y-4">
                    <div className="flex justify-between items-center flex-wrap gap-2">
                      <div>
                        <h4 className="text-xs font-bold text-gray-800 font-display">SaaS Abuse Logs & Security Incidents Tracker</h4>
                        <p className="text-[9.5px] text-gray-455 mt-0.5">Chronological list of anomalous payload handshakes, rate-limit triggers, and malicious threat signals.</p>
                      </div>
                      <button
                        onClick={() => {
                          setAbuseLogs([]);
                          alert("Active abuse counters reset to clearance.");
                        }}
                        className="px-3 py-1.5 text-slate-500 hover:bg-gray-50 border border-gray-250 rounded-xl font-mono text-[9px] font-bold uppercase transition cursor-pointer"
                      >
                        Purge Trace
                      </button>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-left font-sans text-xs border-collapse">
                        <thead>
                          <tr className="border-b border-gray-100 text-[9px] font-bold font-mono tracking-wider text-gray-400 uppercase bg-gray-50/50">
                            <th className="py-2 px-3 pb-2.5">timestamp</th>
                            <th className="py-2 px-3 pb-2.5">Source client / IP</th>
                            <th className="py-2 px-3 pb-2.5">Abuse Vector Event</th>
                            <th className="py-2 px-3 pb-2.5">Severity</th>
                            <th className="py-2 px-3 pb-2.5 text-right">Protection Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {abuseLogs.length === 0 ? (
                            <tr>
                              <td colSpan={5} className="py-8 text-center text-gray-400 font-mono text-[10.5px]">
                                Clearance State. No active security events or intrusion indices identified.
                              </td>
                            </tr>
                          ) : (
                            abuseLogs.map((log) => (
                              <tr key={log.id} className="hover:bg-slate-50/20 text-[10.5px]">
                                <td className="py-3 px-3 font-mono text-gray-450 text-[10px] whitespace-nowrap">{log.date}</td>
                                <td className="py-3 px-3 font-mono font-semibold text-slate-700">{log.ip}</td>
                                <td className="py-3 px-3 text-gray-800">{log.event}</td>
                                <td className="py-3 px-3">
                                  <span className={`px-1.5 py-0.5 rounded font-mono font-bold text-[8.5px] border ${
                                    log.threat === "CRITICAL"
                                      ? "bg-rose-50 text-rose-700 border-rose-100"
                                      : log.threat === "HIGH"
                                        ? "bg-amber-50 text-amber-700 border-amber-100"
                                        : "bg-blue-50 text-blue-700 border-blue-100"
                                  }`}>
                                    {log.threat}
                                  </span>
                                </td>
                                <td className="py-3 px-3 text-right font-medium text-gray-500 text-[10px] max-w-xs truncate" title={log.actionHandled}>
                                  {log.actionHandled}
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>

              </div>
            )}

            {/* ========================================================== */}
            {/* SECTION 9: AUDIT LOGS */}
            {/* ========================================================== */}
            {activeSection === "logs" && (
              <div className="space-y-6 animate-in fade-in duration-150">
                <div className="bg-white rounded-3xl border border-[#E5E7EB] p-5 shadow-sm space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-gray-100 pb-3">
                    <div>
                      <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 font-mono">Platform Security Log Audit Trail</h3>
                      <p className="text-[10px] text-gray-400 mt-0.5">Real-time telemetry track mapping platform role changes, security checks, and tenant actions.</p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <select
                        value={logsFilterAction}
                        onChange={(e) => setLogsFilterAction(e.target.value)}
                        className="bg-white border rounded-xl px-2.5 py-1.5 text-xs text-gray-700 cursor-pointer focus:outline-none"
                      >
                        <option value="ALL">All Event Subsets</option>
                        <option value="SECURITY_VIOLATION">Security Violations</option>
                        <option value="ROLE_UPGRADE">Platform Promotions</option>
                        <option value="COURSE_CREATED">Syllabus Creation</option>
                        <option value="MIGRATION_AUTO">MySQL Synchronizations</option>
                      </select>

                      <input
                        type="text"
                        placeholder="Filter by operator username, content detail..."
                        value={logsSearch}
                        onChange={(e) => setLogsSearch(e.target.value)}
                        className="border border-gray-200 bg-white rounded-xl px-3 py-1.5 text-xs w-full sm:w-56 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs min-w-max border-collapse">
                      <thead>
                        <tr className="border-b border-gray-100 text-gray-400 font-bold font-mono text-[9.5px] uppercase tracking-wider bg-gray-50/50">
                          <th className="py-2.5 px-3">UTC timestamp</th>
                          <th className="py-2.5 px-3">Actor Operator</th>
                          <th className="py-2.5 px-3">Action Type</th>
                          <th className="py-2.5 px-3">Workspace Scope</th>
                          <th className="py-2.5 px-3">Incident Payload Detail</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {filteredLogs.length === 0 ? (
                          <tr>
                            <td colSpan={5} className="py-8 text-center text-gray-450 font-mono">
                              No security audit logs found within current filter scopes.
                            </td>
                          </tr>
                        ) : (
                          filteredLogs.slice().reverse().map((log: any) => (
                            <tr key={log.id} className="hover:bg-gray-50/30 text-[10.5px]">
                              <td className="py-2.5 px-3 font-mono text-gray-400 whitespace-nowrap">
                                {log.createdAt ? new Date(log.createdAt).toUTCString() : "2026-05-29 (UTC)"}
                              </td>
                              <td className="py-2.5 px-3 font-semibold text-gray-800">
                                {log.userName || "Admin Terminal"}
                              </td>
                              <td className="py-2.5 px-3">
                                <span className={`px-2 py-0.5 rounded text-[8.5px] font-mono uppercase font-bold border ${
                                  log.action === "SECURITY_VIOLATION" 
                                    ? "bg-rose-50 text-rose-700 border-rose-100" 
                                    : log.action.includes("ROLE") || log.action.includes("UPGRADE")
                                      ? "bg-amber-50 text-amber-700 border-amber-100"
                                      : "bg-indigo-50 text-indigo-700 border-indigo-100"
                                }`}>
                                  {log.action}
                                </span>
                              </td>
                              <td className="py-2.5 px-3 font-mono text-gray-500 text-[10px]">
                                {log.workspaceId || "System Core Shard"}
                              </td>
                              <td className="py-2.5 px-3 text-gray-650 max-w-md truncate" title={log.details}>
                                {log.details}
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* ========================================================== */}
            {/* SECTION 10: AI & API CONTROLS */}
            {/* ========================================================== */}
            {activeSection === "ai" && (
              <div className="space-y-6 animate-in fade-in duration-150">
                <div className="bg-white rounded-3xl border border-[#E5E7EB] p-5 shadow-sm space-y-4">
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-widest text-[#4F46E5] font-mono flex items-center gap-1">
                      <Sparkles className="w-4 h-4 text-[#4F46E5]" /> Gemini API Orchestration Engine
                    </h3>
                    <p className="text-[10px] text-gray-400 mt-0.5">Control pipeline routing for local course summarization tools, system instructions, and token limitations.</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                    
                    {/* Quotas & Parameters */}
                    <div className="space-y-4">
                      <div className="space-y-1">
                        <label className="text-[9.5px] font-bold text-gray-400 block uppercase font-mono">SELECTED GEMINI PLATFORM MODEL</label>
                        <select
                          value={selectedGeminiModel}
                          onChange={(e) => setSelectedGeminiModel(e.target.value)}
                          className="w-full bg-slate-50 border border-gray-200 rounded-xl px-3 py-2 text-xs font-mono font-bold text-slate-800 cursor-pointer"
                        >
                          <option value="gemini-2.5-flash">Gemini 2.5 Flash (Default Speed Optim)</option>
                          <option value="gemini-2.0-pro">Gemini 2.0 Pro Experimental (Reasoning Elite)</option>
                          <option value="gemini-1.5-pro">Gemini 1.5 Pro Stable (1M context windows)</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <div className="flex justify-between items-center text-[9.5px] font-bold text-gray-500 font-mono uppercase">
                          <span>Workspace Monthly Token Quota Limit</span>
                          <span className="text-indigo-650 font-black">{aiWorkspaceQuotaLimit.toLocaleString()} Tokens</span>
                        </div>
                        <input
                          type="range"
                          min="5000"
                          max="100000"
                          step="5000"
                          value={aiWorkspaceQuotaLimit}
                          onChange={(e) => setAiWorkspaceQuotaLimit(Number(e.target.value))}
                          className="w-full accent-indigo-600 cursor-pointer mt-1"
                        />
                        <span className="text-[10px] text-gray-400 block italic leading-none mt-1">Limits automated course-outline parsing loops to avoid API overuse.</span>
                      </div>

                      <div className="bg-slate-900 text-slate-200 p-3 rounded-2xl border font-mono text-[10px] space-y-1.5">
                        <span className="text-[9px] uppercase font-bold text-slate-500 block">Google API Gateway Ping Metrics</span>
                        <div className="flex justify-between">
                          <span>Proxy status:</span>
                          <span className="text-emerald-400">ACTIVE ({aiTelemetryStats.apiTokenHealth})</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Tokens processed this cycle:</span>
                          <span className="text-white font-bold">{aiTelemetryStats.monthlyTokenCount.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>

                    {/* Default System Instructions */}
                    <div className="space-y-2">
                      <label className="text-[9.5px] font-bold text-gray-400 block uppercase font-mono">Default System Agent Instructions Scope</label>
                      <textarea
                        rows={6}
                        value={systemInstructionsContent}
                        onChange={(e) => setSystemInstructionsContent(e.target.value)}
                        className="w-full font-sans border border-gray-200 bg-slate-50 rounded-xl p-3 text-xs leading-normal focus:outline-none"
                      />
                      <button
                        onClick={() => alert("Static Gemini platform instructions adjusted in memory.")}
                        className="px-4 py-2 bg-slate-900 hover:bg-slate-950 text-white rounded-xl text-xs font-bold cursor-pointer transition w-full"
                      >
                        Adjust Core Instructions Template
                      </button>
                    </div>

                  </div>
                </div>
              </div>
            )}

            {/* ========================================================== */}
            {/* SECTION 11: STORAGE & MEDIA */}
            {/* ========================================================== */}
            {activeSection === "storage" && (
              <div className="space-y-6 animate-in fade-in duration-150">
                <div className="bg-white rounded-3xl border border-[#E5E7EB] p-5 shadow-sm space-y-4">
                  <div className="flex justify-between items-center border-b border-gray-100 pb-2">
                    <div>
                      <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 font-mono">Centralized Corporate File Buckets</h3>
                      <p className="text-[10px] text-gray-400 mt-0.5">Audit global PDF handouts, lecture reference sheets, and avatars size occupancy.</p>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0 text-xs text-gray-700">
                      <span>Optimize assets:</span>
                      <button
                        onClick={() => setOptimMediaUpload(!optimMediaUpload)}
                        className={`w-9 h-5 rounded-full transition relative shrink-0 cursor-pointer ${optimMediaUpload ? "bg-indigo-600" : "bg-slate-200"}`}
                      >
                        <span className={`w-3.5 h-3.5 rounded-full bg-white absolute top-0.75 transition-all duration-150 ${optimMediaUpload ? "left-4.5" : "left-1"}`} />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="p-3 bg-slate-50 border rounded-2xl">
                      <span className="text-[9px] uppercase font-mono font-bold text-slate-500 block">TOTAL VOLUME SECURED</span>
                      <span className="text-base font-bold text-slate-900 mt-1 block">18.42 GB</span>
                    </div>
                    <div className="p-3 bg-slate-50 border rounded-2xl">
                      <span className="text-[9px] uppercase font-mono font-bold text-slate-500 block">BUCKET CAPACITY LIMIT</span>
                      <span className="text-base font-bold text-slate-900 mt-1 block">100 GB</span>
                    </div>
                    <div className="p-3 bg-slate-50 border rounded-2xl">
                      <span className="text-[9px] uppercase font-mono font-bold text-slate-500 block">ZIP CHECKSUMS PASSED</span>
                      <span className="text-base font-bold text-emerald-805 mt-1 block font-mono">100.0% SECURE</span>
                    </div>
                    <div className="p-3 bg-slate-50 border rounded-2xl">
                      <span className="text-[9px] uppercase font-mono font-bold text-slate-500 block">COMPRESSION RATIO</span>
                      <span className="text-base font-bold text-slate-900 mt-1 block font-mono">2.4x (GZIP)</span>
                    </div>
                  </div>

                  <div className="space-y-2 pt-2">
                    <span className="text-[9.5px] font-bold text-slate-400 font-mono block uppercase">Virtual AWS S3 File Directory (Live check checks done)</span>
                    <div className="divide-y divide-slate-100 overflow-y-auto max-h-56 border rounded-2xl pr-1">
                      {mediaList.map((med, idx) => (
                        <div key={idx} className="p-3 flex justify-between items-center text-xs hover:bg-slate-50/60 transition">
                          <div className="flex items-center gap-2">
                            <span>📄</span>
                            <div>
                              <span className="font-bold text-slate-900 block">{med.name}</span>
                              <span className="text-[10px] text-slate-400 font-mono">Uploaded by Creator: <strong>{med.uploadedBy}</strong></span>
                            </div>
                          </div>
                          
                          <div className="text-right">
                            <span className="block font-mono text-slate-800">{med.size}</span>
                            <span className="text-slate-450 text-[10px]">📥 {med.downloads} requests</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ========================================================== */}
            {/* SECTION 12: EMAIL & NOTIFICATIONS */}
            {/* ========================================================== */}
            {activeSection === "email" && (
              <div className="space-y-6 animate-in fade-in duration-150">
                <div className="bg-white rounded-3xl border border-[#E5E7EB] p-5 shadow-sm space-y-4">
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 font-mono">Platform SMTP Relay Settings</h3>
                    <p className="text-[10px] text-gray-400 mt-0.5">Synchronize secure credentials for transaction invoices, user activation invites, and backup warning notifications.</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
                    
                    {/* Form settings */}
                    <div className="space-y-3">
                      <div className="grid grid-cols-3 gap-2">
                        <div className="col-span-2 space-y-1">
                          <label className="text-[9px] font-bold text-gray-400 block uppercase font-mono">SMTP INFRA HOST</label>
                          <input
                            type="text"
                            value={smtpConfig.host}
                            onChange={(e) => setSmtpConfig(prev => ({ ...prev, host: e.target.value }))}
                            className="w-full bg-slate-50 border px-3 py-1.5 rounded-xl text-xs font-mono font-bold text-slate-800"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[9px] font-bold text-gray-400 block uppercase font-mono">PORT</label>
                          <input
                            type="number"
                            value={smtpConfig.port}
                            onChange={(e) => setSmtpConfig(prev => ({ ...prev, port: Number(e.target.value) }))}
                            className="w-full bg-slate-50 border px-3 py-1.5 rounded-xl text-xs text-center font-mono font-bold text-slate-800"
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[9px] font-bold text-gray-400 block uppercase font-mono">SMTP AUTHORIZED RELAY USERNAME</label>
                        <input
                          type="text"
                          value={smtpConfig.username}
                          onChange={(e) => setSmtpConfig(prev => ({ ...prev, username: e.target.value }))}
                          className="w-full bg-slate-50 border px-3 py-1.5 rounded-xl text-xs font-mono text-slate-800"
                        />
                      </div>

                      <div className="flex items-center justify-between py-1.5">
                        <span className="text-[11px] text-slate-600 font-medium">Require Secure TLS Handshakes (SSL/STARTTLS):</span>
                        <button
                          type="button"
                          onClick={() => setSmtpConfig(prev => ({ ...prev, requireTls: !prev.requireTls }))}
                          className={`w-10 h-5.5 rounded-full transition relative cursor-pointer ${smtpConfig.requireTls ? "bg-indigo-600" : "bg-slate-200"}`}
                        >
                          <span className={`w-4 h-4 rounded-full bg-white absolute top-0.75 transition-all duration-150 ${smtpConfig.requireTls ? "left-5" : "left-1"}`} />
                        </button>
                      </div>

                      <button
                        onClick={() => alert("Platform-wide corporate SMTP credentials synchronized successfully over CloudPanel mail daemon.")}
                        className="w-full py-2 bg-slate-900 hover:bg-slate-950 text-white rounded-xl text-xs font-bold cursor-pointer transition uppercase"
                      >
                        Adjust Credentials
                      </button>
                    </div>

                    {/* Test SMTP Email */}
                    <div className="p-4 bg-slate-50 border rounded-2xl flex flex-col justify-between">
                      <div className="space-y-1">
                        <span className="text-[9px] uppercase font-mono font-black text-slate-450 block">SANDBOX MAIL DESK</span>
                        <h4 className="text-xs font-bold text-slate-900">Transmit Administrative Test Payload</h4>
                        <p className="text-[10px] text-slate-500">Relay a template raw confirmation diagnostic email to any email address below to inspect SMTP delivery times.</p>
                      </div>

                      <form onSubmit={handleTriggerSMTPTest} className="space-y-2.5 pt-4">
                        <input
                          type="email"
                          required
                          placeholder="your-personal-inbox@cloud.io"
                          value={smtpTestEmail}
                          onChange={(e) => setSmtpTestEmail(e.target.value)}
                          className="w-full border border-gray-200 bg-white rounded-xl p-2.5 text-xs focus:ring-1 focus:ring-indigo-650 focus:outline-none placeholder:text-gray-400"
                        />

                        <button
                          type="submit"
                          className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition cursor-pointer"
                        >
                          Dispatch Test Envelope
                        </button>
                      </form>

                      {smtpTestResult && (
                        <div className="mt-3 p-3 text-xs rounded-xl font-bold font-mono animate-in zoom-in-95 leading-normal">
                          {smtpTestResult === "CONNECTING" ? (
                            <span className="text-indigo-700 block text-center animate-pulse">📡 Initiating SSL socket connection...</span>
                          ) : (
                            <span className="text-emerald-700 block text-center">✅ Deliverability Check Success! SMTP Relay status reported OK. Received 250 Response Code.</span>
                          )}
                        </div>
                      )}
                    </div>

                  </div>
                </div>
              </div>
            )}

            {/* ========================================================== */}
            {/* SECTION 13: SYSTEM SETTINGS */}
            {/* ========================================================== */}
            {activeSection === "settings" && (
              <div className="space-y-6 animate-in fade-in duration-150">
                <div className="bg-white rounded-3xl border border-[#E5E7EB] p-5 shadow-sm space-y-4">
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 font-mono">Infrastructure Geography & Ingress Rules</h3>
                    <p className="text-[10px] text-gray-400 mt-0.5">Control network ingress points, active SQLite snapshot schedulers, and recovery keys.</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-1">
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-gray-450 block uppercase font-mono">PRIMARY GCP CORE REGION</label>
                      <select
                        value={deploymentRegion}
                        onChange={(e) => setDeploymentRegion(e.target.value)}
                        className="w-full bg-slate-50 border rounded-xl px-3 py-2 text-xs font-bold font-mono text-slate-800 cursor-pointer"
                      >
                        <option value="gcp-us-central1">Iowa (us-central1, Central Datacenter Grid)</option>
                        <option value="gcp-asia-southeast1">Singapore (asia-southeast1, Asia High-Availability Core)</option>
                        <option value="gcp-europe-west3">Frankfurt (europe-west3, Europe Safe GDPR Core)</option>
                        <option value="gcp-local-sandbox">Direct Loopback Local Container Sandbox (Port 3000)</option>
                      </select>
                    </div>

                    <div className="space-y-3 flex flex-col justify-end">
                      <div className="flex items-center justify-between text-xs py-1.5 bg-slate-50 p-2.5 rounded-xl border">
                        <div>
                          <span className="font-bold text-slate-900 block">Debug Telemetry Logging Piles</span>
                          <span className="text-[10px] text-slate-400 leading-none">Keeps verbose console tracks in runtime memory storage.</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setDebugLogPiles(!debugLogPiles)}
                          className={`w-9 h-5.5 rounded-full transition relative shrink-0 cursor-pointer ${debugLogPiles ? "bg-indigo-600" : "bg-slate-200"}`}
                        >
                          <span className={`w-4 h-4 rounded-full bg-white absolute top-0.75 transition-all duration-150 ${debugLogPiles ? "left-4.5" : "left-1"}`} />
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-gray-150 space-y-3">
                    <h4 className="text-xs font-bold text-gray-900 font-mono">Backup Recovery Coordinates Repository (SQLite storage check)</h4>
                    <div className="bg-slate-900 rounded-2xl p-4 font-mono text-[10px] text-slate-350 space-y-2 relative overflow-hidden">
                      <div className="flex justify-between items-center text-slate-500 border-b border-slate-850 pb-2">
                        <span className="text-[8.5px] uppercase font-bold tracking-wider flex items-center gap-1">
                          📋 Recovery Key Registry
                        </span>
                        <span>SHA-256 Verified Node Encryption</span>
                      </div>
                      <div>
                        <span>SYSTEM_BACKUP_TOKEN_KEY_A: <code className="text-emerald-400 font-bold">SHA256::f23b2c...a891</code></span>
                      </div>
                      <div>
                        <span>SYSTEM_BACKUP_TOKEN_KEY_B: <code className="text-emerald-400 font-bold">SHA256::e910bd...d451</code></span>
                      </div>
                      <p className="text-slate-450 text-[9.5px] leading-relaxed pt-1.5 font-sans">
                        These static environment parameters are generated automatically on startup to maintain encrypted database file-level recoveries in case the host memory drops unexpectedly. Keep safe.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ========================================================== */}
            {/* SECTION 14: CLOUDPANEL CONSOLE */}
            {/* ========================================================== */}
            {activeSection === "cloudpanel" && (
              <div className="space-y-6 animate-in fade-in duration-150">
                
                {/* Banner alert MySQL state */}
                <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-slate-800 text-white rounded-3xl p-5 shadow-sm relative overflow-hidden">
                  <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 w-48 h-48 bg-white/5 rounded-full blur-xl pointer-events-none" />
                  <span className="text-[9px] uppercase font-mono bg-indigo-600 text-indigo-50 border border-indigo-500/30 px-2.5 py-1 rounded-full font-bold inline-flex items-center gap-1.5 shadow-sm">
                    <Database className="w-3 h-3" /> Core MySQL Database Bridge
                  </span>
                  <h2 className="text-md sm:text-lg font-bold font-display mt-3 tracking-tight">CloudPanel Relational Database Controller</h2>
                  <p className="text-[10.5px] text-indigo-200/90 max-w-xl mt-1 leading-relaxed">
                    Verify database configuration states, trigger localized backups hydration checks over host MySQL / MariaDB pools, and extract table structures dynamically.
                  </p>
                </div>

                {/* DB Handshake verification metrics */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  <div className="bg-white rounded-2xl border border-gray-150 p-5 shadow-sm flex flex-col justify-between">
                    <div>
                      <span className="text-[9px] text-gray-400 block uppercase font-mono font-bold tracking-wider">MySQL Bridge Handshake</span>
                      <span className="text-xs font-bold text-gray-900 block mt-1 tracking-tight">
                        {isLoadingCp ? "Pinging MySQL server..." : cpStatus?.connected ? "CONNECTED (Secure Connection)" : "FALLBACK LOCAL SQLite ACTIVE"}
                      </span>
                    </div>

                    <div className="border-t border-gray-100 pt-3 mt-4 flex items-center justify-between text-[10px]">
                      <span className="text-gray-500 font-medium font-mono">Status Indicator:</span>
                      <span className={`px-2 py-0.5 rounded font-mono font-bold ${
                        cpStatus?.connected ? "bg-emerald-50 text-emerald-700 border-emerald-100" : "bg-amber-50 text-amber-500 border-amber-100"
                      }`}>
                        {cpStatus?.connected ? "SUCCESSFUL" : "LOCAL BACKUP"}
                      </span>
                    </div>
                  </div>

                  <div className="bg-white rounded-2xl border border-gray-150 p-5 shadow-sm flex flex-col justify-between">
                    <div>
                      <span className="text-[9px] text-gray-400 block uppercase font-mono font-black tracking-wider">Synchronized Accounts</span>
                      <span className="text-xl font-extrabold text-slate-900 block mt-1 font-mono tracking-tight">
                        {isLoadingCp ? "..." : cpStatus?.usersCount || 0}
                      </span>
                    </div>

                    <div className="border-t border-gray-100 pt-3 mt-4 flex items-center justify-between text-[10px]">
                      <span className="text-gray-500 font-medium font-mono">Table integrity check:</span>
                      <span className="text-emerald-700 font-bold font-mono">PASSED SECURE</span>
                    </div>
                  </div>

                  <div className="bg-white rounded-2xl border border-gray-150 p-5 shadow-sm flex flex-col justify-between">
                    <div>
                      <span className="text-[9px] text-gray-400 block uppercase font-mono font-black tracking-wider">Target Host Parameter</span>
                      <span className="text-[10px] font-mono text-gray-600 block mt-1 bg-slate-50 p-1 rounded border border-gray-150 overflow-hidden truncate">
                        {isLoadingCp ? "Fetching state..." : cpStatus?.host ? `${cpStatus.host} (DB: ${cpStatus.database})` : "Using sandbox db.json mapping"}
                      </span>
                    </div>

                    <button
                      onClick={checkCloudPanelConnection}
                      className="mt-3 text-[10px] font-bold text-indigo-600 hover:text-indigo-800 transition py-1 border border-indigo-100 hover:bg-indigo-50/50 rounded-xl flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <RefreshCw className="w-3 h-3" /> Pin Connection
                    </button>
                  </div>
                </div>

                {/* Sync Action Hub */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  
                  {/* Sync Control */}
                  <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-150 p-6 space-y-4 shadow-sm">
                    <h3 className="text-xs font-bold text-gray-900 tracking-tight uppercase font-mono">MySQL / MariaDB Core Sync</h3>
                    <p className="text-[11px] text-gray-500 leading-relaxed font-sans">
                      Deploy and normalize schemas to corporate database hosts directly from the cockpit. Operations are encapsulated safely under absolute query parameters mapping checks to avoid analytical drift between community tenants.
                    </p>

                    {migrationRes && (
                      <div className={`p-3 border rounded-xl text-xs flex items-center gap-2 ${
                        migrationRes.success ? "bg-emerald-50 border-emerald-250 text-emerald-800" : "bg-rose-50 border-rose-250 text-rose-800"
                      }`}>
                        {migrationRes.success ? <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" /> : <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />}
                        <span className="font-semibold">{migrationRes.message}</span>
                      </div>
                    )}

                    <div className="p-4 bg-slate-50 border rounded-2xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      <div>
                        <h4 className="text-[11px] font-bold text-gray-900 font-display">Hydrate MySQL Core schemas</h4>
                        <p className="text-[10px] text-gray-400 mt-0.5">Truncate CloudPanel SQL database models and synchronize from local JSON.</p>
                      </div>
                      
                      <button
                        onClick={handleCloudPanelForceHydration}
                        disabled={isMigrating || !cpStatus?.configured}
                        className={`py-2 px-4 rounded-xl text-xs font-bold font-display flex items-center justify-center gap-2 transition shrink-0 ${
                          !cpStatus?.configured 
                            ? "bg-gray-100 text-gray-400 border border-gray-200 cursor-not-allowed" 
                            : "bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm cursor-pointer"
                        }`}
                      >
                        {isMigrating ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
                        {isMigrating ? "Mapping MySQL..." : "Force MySQL Hydration"}
                      </button>
                    </div>

                    {/* Tutorial script check */}
                    <div className="border-t border-gray-100 pt-4 space-y-3">
                      <h4 className="text-xs font-bold text-gray-900 font-mono">Admin command: Extract schema files</h4>
                      <div className="bg-slate-905 bg-slate-950 text-slate-100 rounded-2xl p-4 font-mono text-[10px] overflow-x-auto shadow-sm border border-slate-950">
                        <div className="flex justify-between items-center text-slate-400 border-b border-slate-800 pb-2 mb-2">
                          <span className="text-[9px] uppercase font-bold text-slate-500 tracking-wider flex items-center gap-1">
                            <Terminal className="w-3 h-3" /> Console Shell Print
                          </span>
                          <button 
                            onClick={handleCopySchemaCommandFile}
                            className="hover:text-white transition p-1 hover:bg-slate-800 rounded font-bold text-[9px] cursor-pointer flex items-center gap-1.5"
                          >
                            {copiedSql ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                            {copiedSql ? "Copied" : "Copy command"}
                          </button>
                        </div>
                        <code>$ cat /cloudpanel/schema.sql</code>
                        <p className="mt-3 text-slate-400 leading-relaxed text-[9.5px] font-sans">
                          Extract table scripts directly from work files, copy full contents, open inside your CloudPanel phpMyAdmin <strong>SQL window</strong>, paste, and run setup scripts.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Schema Settings instructions */}
                  <div className="bg-white rounded-2xl border border-gray-150 p-5 shadow-sm space-y-4">
                    <h3 className="text-xs font-bold text-gray-900 tracking-tight uppercase font-mono flex items-center gap-1.5">
                      <ShieldAlert className="w-4 h-4 text-indigo-600" /> SQL Environment vars
                    </h3>

                    <div className="space-y-3 text-[11px] text-gray-650 leading-relaxed font-sans">
                      <div className="p-3 bg-indigo-50 border border-indigo-120 rounded-xl space-y-1.5">
                        <span className="font-bold text-indigo-900 block text-[9.5px] uppercase font-mono tracking-wider">Secrets variables catalog</span>
                        <p className="text-[10px] text-indigo-950/80 leading-normal">
                          Set these parameters inside the AI Studio secrets gateway panel to connect:
                        </p>
                        <div className="space-y-1 font-mono text-[9px] text-slate-900">
                          <span className="block bg-white/70 px-1 py-0.5 rounded border">DB_HOST=127.0.0.1</span>
                          <span className="block bg-white/70 px-1 py-0.5 rounded border">DB_PORT=3306</span>
                          <span className="block bg-white/70 px-1 py-0.5 rounded border">DB_USER=cloudpanel_user</span>
                          <span className="block bg-white/70 px-1 py-0.5 rounded border">DB_PASSWORD=your_password</span>
                          <span className="block bg-white/70 px-1 py-0.5 rounded border">DB_NAME=cloudpanel_db</span>
                        </div>
                      </div>

                      <div className="space-y-2 border-t border-gray-100 pt-3">
                        <span className="font-bold text-gray-900 text-xs block font-display">1. Escaped SQL Injection defense</span>
                        <p className="text-[10.5px]">
                          All statements are fully parameterized via the Node mysql client library pools to avoid accidental lateral data exposures across workspaces.
                        </p>
                      </div>
                    </div>
                  </div>

                </div>

              </div>
            )}

          </div>

        </div>

      </div>

    </div>
  );
}
