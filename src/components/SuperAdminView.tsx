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
  activeSection: string;
}

export default function SuperAdminView({ currentUser, communities, activeSection }: SuperAdminViewProps) {

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

  // Owner Payouts state
  const [ownersPayoutList, setOwnersPayoutList] = useState([
    { id: "cr01", name: "Haskell Masterclass Co.", email: "haskell.pro@tech.org", unpaidEarnings: 1480, status: "READY", lastPayoutDate: "2026-05-12" },
    { id: "cr02", name: "Figma UX Guild", email: "uxfigma.school@gmail.com", unpaidEarnings: 820, status: "READY", lastPayoutDate: "2026-05-18" },
    { id: "cr03", name: "Solidity Bootcamps Inc.", email: "contracts@solidity.zone", unpaidEarnings: 3200, status: "READY", lastPayoutDate: "2026-04-30" },
    { id: "cr04", name: "DevOps & Cloud Native Rails", email: "kubernetes.infra@outlook.com", unpaidEarnings: 0, status: "PROCESSED", lastPayoutDate: "2026-05-28" },
    { id: "cr05", name: "Minimalist Design Co.", email: "inter.typography@gmail.com", unpaidEarnings: 450, status: "READY", lastPayoutDate: "2026-05-01" },
  ]);
  const [payoutProcessingId, setPayoutProcessingId] = useState<string | null>(null);

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
  const handleProcessOwnerPayoutNow = (payoutId: string) => {
    setPayoutProcessingId(payoutId);
    setTimeout(() => {
      setOwnersPayoutList(prev => prev.map(cr => cr.id === payoutId ? { ...cr, unpaidEarnings: 0, status: "PROCESSED" } : cr));
      setPayoutProcessingId(null);
      alert("Payout processed successfully.");
    }, 1500);
  };

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
      <div className="flex-1 overflow-y-auto flex flex-col min-w-0" id="super-admin-view-viewport">
        
        {/* Header Dashboard Banner */}
        <div className="p-4 sm:p-5 bg-white border-b border-[#E5E7EB] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 shrink-0">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-bold text-gray-900 font-display tracking-tight flex items-center gap-1.5">
                🌐 Platform Control Dashboard
              </span>
              <span className="text-xs font-mono bg-slate-900 text-white px-2 py-0.5 rounded-full font-bold">
                Admin
              </span>
            </div>
            <p className="text-[10px] text-gray-400 mt-0.5 leading-relaxed">
              Centralized telemetry & node configuration panel. Live-routing across {communities.length} tenant databases.
            </p>
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
                
                {/* Premium Stat Cards */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="stat-card-emerald rounded-2xl p-5 relative overflow-hidden">
                    <div className="absolute right-0 top-0 w-24 h-24 bg-white/10 rounded-full -translate-y-8 translate-x-8" />
                    <span className="text-sm font-semibold text-slate-900">Status</span>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-white animate-pulse" />
                      <span className="text-sm font-black font-mono tracking-tight">Operational</span>
                    </div>
                  </div>

                  <div className="stat-card-brand rounded-2xl p-5 relative overflow-hidden">
                    <div className="absolute right-0 top-0 w-24 h-24 bg-white/10 rounded-full -translate-y-8 translate-x-8" />
                    <span className="text-sm font-semibold text-slate-900">Database</span>
                    <span className="text-xs font-bold font-mono block mt-2 truncate">
                      {cpStatus?.connected ? "CLOUDPANEL MYSQL" : "SQLite FILE MEMORY"}
                    </span>
                  </div>

                  <div className="stat-card-slate rounded-2xl p-5 relative overflow-hidden">
                    <div className="absolute right-0 top-0 w-24 h-24 bg-white/10 rounded-full -translate-y-8 translate-x-8" />
                    <span className="text-sm font-semibold text-slate-900">Communities</span>
                    <span className="text-sm font-extrabold font-mono block mt-2">
                      {communities.length} Active
                    </span>
                  </div>

                  <div className="stat-card-cyan rounded-2xl p-5 relative overflow-hidden">
                    <div className="absolute right-0 top-0 w-24 h-24 bg-white/10 rounded-full -translate-y-8 translate-x-8" />
                    <span className="text-sm font-semibold text-slate-900">Revenue</span>
                    <span className="text-sm font-extrabold font-mono block mt-2">
                      ${totalMRR.toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Left/Right Layout for Main dashboard */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  
                  {/* Tenants Summary */}
                  <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-4">
                    <div className="flex justify-between items-center border-b border-slate-100 pb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-slate-900">Communities</h3>
                        <p className="text-[10px] text-slate-400 mt-0.5">Isolated relational databases under active DNS mapping.</p>
                      </div>
                      <span className="text-[10px] bg-slate-100 text-slate-600 font-mono font-bold px-2.5 py-1 rounded-lg">{communities.length} active</span>
                    </div>

                    <div className="divide-y divide-slate-100 overflow-y-auto max-h-80 pr-1">
                      {communities.map((comm) => (
                        <div key={comm.id} className="py-3.5 flex justify-between items-center text-xs hover:bg-slate-50/80 px-2 rounded-xl transition group">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm shrink-0 shadow-sm">
                              {comm.branding?.logoUrl || comm.name?.[0] || "S"}
                            </div>
                            <div>
                              <span className="font-bold text-slate-900 block group-hover:text-indigo-600 transition">{comm.name}</span>
                              <span className="text-[10px] text-slate-400 font-mono">
                                {comm.subdomain}.skool
                              </span>
                            </div>
                          </div>
                          <div className="text-right">
                            <span className="block font-bold text-slate-900 font-mono">${comm.isPremium ? comm.priceMonthly : 0}<span className="text-slate-400 font-normal text-[10px]">/mo</span></span>
                            <span className="text-slate-400 text-[10px]">{comm.membersCount} members</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Broadcast Alert */}
                  <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm flex flex-col justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-slate-900">Send Announcement</h3>
                      <p className="text-[10px] text-slate-400 mt-1 leading-relaxed">
                        Send a banner notification to all registered workspace pages.
                      </p>
                    </div>

                    <form onSubmit={handleDispatchBroadcast} className="space-y-3 mt-4">
                      {broadcastSuccess ? (
                        <div className="p-4 bg-emerald-50 text-emerald-800 rounded-xl text-center text-xs space-y-1 border border-emerald-100 animate-in zoom-in-95 duration-150">
                          <span className="font-bold block">Broadcast Sent</span>
                          <p className="text-[9.5px] text-emerald-600">Alert dispatched to all active channels.</p>
                        </div>
                      ) : (
                        <>
                          <textarea
                            rows={4}
                            required
                            placeholder="e.g. Maintenance Notice: Scheduled downtime at 04:00 UTC."
                            value={broadcastMessage}
                            onChange={(e) => setBroadcastMessage(e.target.value)}
                            className="w-full border border-slate-200 bg-slate-50/50 rounded-xl p-3 text-xs focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 focus:outline-none placeholder:text-slate-400 leading-normal font-sans transition"
                          />
                          
                          <button
                            type="submit"
                            className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-sm shadow-indigo-200 transition"
                          >
                            <Send className="w-3.5 h-3.5" />
                            Send Broadcast
                          </button>
                        </>
                      )}
                    </form>
                  </div>

                </div>

                {/* Quick Platform Actions Card */}
                <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 font-mono mb-4">Quick Actions</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <button 
                      onClick={() => { alert("MySQL cache flush initiated."); checkCloudPanelConnection(); }}
                      className="p-4 bg-indigo-50/50 hover:bg-indigo-50 border border-indigo-100 text-indigo-700 rounded-xl text-xs text-left font-bold transition-all hover:shadow-sm flex items-center justify-between group"
                    >
                      <span>Flush MySQL Cache</span>
                      <ArrowRight className="w-4 h-4 text-indigo-400 group-hover:text-indigo-600 group-hover:translate-x-0.5 transition shrink-0" />
                    </button>
                    <button 
                      onClick={() => alert("System snapshot captured.")}
                      className="p-4 bg-emerald-50/50 hover:bg-emerald-50 border border-emerald-100 text-emerald-700 rounded-xl text-xs text-left font-bold transition-all hover:shadow-sm flex items-center justify-between group"
                    >
                      <span>Capture Snapshot</span>
                      <ArrowRight className="w-4 h-4 text-emerald-400 group-hover:text-emerald-600 group-hover:translate-x-0.5 transition shrink-0" />
                    </button>
                    <button 
                      onClick={() => { setMaintenanceModeActive(!maintenanceModeActive); alert("Maintenance mode toggled."); }}
                      className={`p-4 border rounded-xl text-xs text-left font-bold transition-all hover:shadow-sm flex items-center justify-between group ${
                        maintenanceModeActive 
                          ? "bg-rose-50 border-rose-200 text-rose-700" 
                          : "bg-slate-50/50 hover:bg-slate-50 border-slate-200 text-slate-600"
                      }`}
                    >
                      <span>{maintenanceModeActive ? "Disable Maintenance" : "Enable Maintenance"}</span>
                      <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition shrink-0" />
                    </button>
                    <button 
                      onClick={() => { setShieldThreatLevel("LOW"); setAlarmActive(false); alert("Security alerts cleared."); }}
                      className="p-4 bg-cyan-50/50 hover:bg-cyan-50 border border-cyan-100 text-cyan-700 rounded-xl text-xs text-left font-bold transition-all hover:shadow-sm flex items-center justify-between group"
                    >
                      <span>Clear Security Alerts</span>
                      <ArrowRight className="w-4 h-4 text-cyan-400 group-hover:text-cyan-600 group-hover:translate-x-0.5 transition shrink-0" />
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
            )}

            {/* ========================================================== */}
            {/* SECTION 3: USER MANAGEMENT */}
            {/* ========================================================== */}
            {activeSection === "users" && (
              <div className="space-y-6 animate-in fade-in duration-150">
                <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                      <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 font-mono">User Management</h3>
                      <p className="text-[10px] text-slate-400 mt-0.5">Manage platform roles and security clearance levels.</p>
                    </div>

                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Search by name, email, role..."
                        value={usersSearch}
                        onChange={(e) => setUsersSearch(e.target.value)}
                        className="w-full sm:w-64 pl-3 pr-4 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 focus:outline-none transition"
                      />
                    </div>
                  </div>

                  <div className="divide-y divide-slate-100 max-h-96 overflow-y-auto pr-1">
                    {filteredUsers.length === 0 ? (
                      <div className="py-12 text-center text-slate-400 font-mono text-xs">
                        No users matching search criteria.
                      </div>
                    ) : (
                      filteredUsers.map((userObj) => (
                        <div key={userObj.id} className="py-3.5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 text-xs hover:bg-slate-50/80 px-2 rounded-xl transition group">
                          <div className="flex items-center gap-3">
                            {userObj.avatarUrl ? (
                              <img
                                src={userObj.avatarUrl}
                                alt="avatar"
                                referrerPolicy="no-referrer"
                                className="w-9 h-9 rounded-full border border-slate-200 object-cover"
                              />
                            ) : (
                              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white font-bold text-sm">
                                {(userObj.fullName || "U")[0]}
                              </div>
                            )}
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-slate-900 group-hover:text-indigo-600 transition">{userObj.fullName || "Unknown"}</span>
                                <span className="text-[9px] bg-slate-100 text-slate-500 font-mono px-1.5 py-0.5 rounded">
                                  Lvl {userObj.level || 1}
                                </span>
                              </div>
                              <span className="text-[10.5px] text-slate-400 font-mono">{userObj.email}</span>
                            </div>
                          </div>

                          <div className="flex items-center gap-3 justify-between sm:justify-end">
                            <select
                              disabled={userObj.id === currentUser?.id}
                              value={userObj.platformRole || "user"}
                              onChange={(e) => handleUpdatePlatformRole(userObj.id, e.target.value)}
                              className="border border-slate-200 bg-white text-xs px-2.5 py-1.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 cursor-pointer disabled:opacity-40 font-semibold text-slate-600 transition"
                            >
                              <option value="user">User</option>
                              <option value="owner">Owner</option>
                              <option value="support_staff">Support Staff</option>
                              <option value="super_admin">Super Admin</option>
                            </select>

                            <button
                              onClick={() => {
                                alert(`Account suspension triggered for ${userObj.fullName}.`);
                              }}
                              className="px-2.5 py-1.5 border border-slate-200 hover:bg-red-50 hover:border-red-200 hover:text-red-600 text-slate-400 rounded-lg text-[10px] uppercase font-mono font-bold cursor-pointer transition"
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
                  
                  {/* Workspace List */}
                  <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-4">
                    <div>
                      <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 font-mono">Workspaces</h3>
                      <p className="text-[10px] text-slate-400 mt-0.5">Manage tenant namespaces and database links.</p>
                    </div>

                    <div className="divide-y divide-slate-100 max-h-90 overflow-y-auto pr-1">
                      {communities.map((comm) => (
                        <div key={comm.id} className="py-3.5 flex items-center justify-between text-xs hover:bg-slate-50/80 px-2 rounded-xl transition group">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm shrink-0 shadow-sm">
                              {comm.branding?.logoUrl || comm.name?.[0] || "S"}
                            </div>
                            <div>
                              <span className="font-bold text-slate-900 block group-hover:text-indigo-600 transition">{comm.name}</span>
                              <span className="text-[10px] text-indigo-500 font-mono block mt-0.5">
                                {comm.subdomain}.skool
                              </span>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-4">
                            <div className="text-right hidden sm:block">
                              <span className="font-bold font-mono text-slate-900">${comm.isPremium ? comm.priceMonthly : 0}<span className="text-slate-400 font-normal text-[10px]">/mo</span></span>
                            </div>
                            <button 
                              onClick={() => alert(`Health check for "${comm.name}". Schema validated.`)}
                              className="px-2.5 py-1.5 hover:bg-slate-100 border border-slate-200 rounded-lg font-bold text-[10px] text-slate-600 cursor-pointer transition"
                            >
                              Check
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Provision Form */}
                  <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm flex flex-col justify-between">
                    <div>
                      <h3 className="text-xs font-bold uppercase tracking-widest text-indigo-600 font-mono">New Workspace</h3>
                      <p className="text-[10px] text-slate-400 mt-1 leading-relaxed">
                        Deploy a new tenant container with custom subdomain.
                      </p>
                    </div>

                    <form onSubmit={handleSimulateWorkspaceProvision} className="space-y-3 mt-4">
                      <div>
                        <label className="text-[9.5px] font-bold text-slate-400 block uppercase font-mono mb-1">Name</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Next.js Academy"
                          value={simWsName}
                          onChange={(e) => setSimWsName(e.target.value)}
                          className="w-full border border-slate-200 bg-slate-50/50 px-3 py-2 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 focus:outline-none placeholder:text-slate-400 transition"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-[9.5px] font-bold text-slate-400 block uppercase font-mono mb-1">Subdomain</label>
                          <input
                            type="text"
                            required
                            placeholder="nextclass"
                            value={simWsSubdomain}
                            onChange={(e) => setSimWsSubdomain(e.target.value)}
                            className="w-full border border-slate-200 bg-slate-50/50 px-3 py-2 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 focus:outline-none placeholder:text-slate-400 transition"
                          />
                        </div>
                        <div>
                          <label className="text-[9.5px] font-bold text-slate-400 block uppercase font-mono mb-1">Price ($/mo)</label>
                          <input
                            type="number"
                            required
                            min={0}
                            placeholder="49"
                            value={simWsPrice}
                            onChange={(e) => setSimWsPrice(Number(e.target.value))}
                            className="w-full border border-slate-200 bg-slate-50/50 px-3 py-2 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 focus:outline-none placeholder:text-slate-400 text-center transition"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="text-[9.5px] font-bold text-slate-400 block uppercase font-mono mb-1">Owner Email</label>
                        <input
                          type="email"
                          required
                          placeholder="owner@domain.com"
                          value={simWsEmail}
                          onChange={(e) => setSimWsEmail(e.target.value)}
                          className="w-full border border-slate-200 bg-slate-50/50 px-3 py-2 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 focus:outline-none placeholder:text-slate-400 transition"
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={simIsProvisioning}
                        className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-sm shadow-indigo-200 transition"
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

            {/* ========================================================== */}
            {/* SECTION 6: REVENUE ANALYTICS */}
            {/* ========================================================== */}
            {/* SECTION 6: REVENUE ANALYTICS */}
            {/* ========================================================== */}
            {activeSection === "revenue" && (
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

                  {/* Fee split visualization */}
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
            )}

            {/* ========================================================== */}
            {/* SECTION 7: OWNER PAYOUTS */}
            {/* ========================================================== */}
            {activeSection === "payouts" && (
              <div className="space-y-6 animate-in fade-in duration-150">
                <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-4">
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 font-mono">Owner Payouts</h3>
                    <p className="text-[10px] text-slate-400 mt-0.5">Review and approve pending wire transfers to community owners.</p>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="border-b border-slate-200 text-slate-400 font-bold font-mono text-[9.5px] uppercase tracking-wider bg-slate-50/50">
                          <th className="py-2.5 px-3">Organization</th>
                          <th className="py-2.5 px-3">Email</th>
                          <th className="py-2.5 px-3 text-right">Balance Due</th>
                          <th className="py-2.5 px-3">Status</th>
                          <th className="py-2.5 px-3 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {ownersPayoutList.map((cr) => (
                          <tr key={cr.id} className="hover:bg-slate-50/80 text-[10.5px] transition">
                            <td className="py-3 px-3 font-bold text-slate-900">{cr.name}</td>
                            <td className="py-3 px-3 text-slate-500 font-mono">{cr.email}</td>
                            <td className="py-3 px-3 text-right font-bold font-mono text-slate-900">
                              ${cr.unpaidEarnings.toLocaleString()}
                            </td>
                            <td className="py-3 px-3">
                              <span className={`px-2 py-0.5 rounded text-[8.5px] font-mono uppercase font-bold border ${
                                cr.unpaidEarnings > 0 
                                  ? "bg-amber-50 text-amber-600 border-amber-200" 
                                  : "bg-emerald-50 text-emerald-600 border-emerald-200"
                              }`}>
                                {cr.unpaidEarnings > 0 ? "Pending" : "Settled"}
                              </span>
                            </td>
                            <td className="py-3 px-3 text-right">
                              {payoutProcessingId === cr.id ? (
                                <span className="text-[11px] font-bold text-indigo-600 flex items-center gap-1 justify-end font-mono animate-pulse">
                                  <RefreshCw className="w-3 h-3 animate-spin" /> Processing...
                                </span>
                              ) : cr.unpaidEarnings > 0 ? (
                                <button
                                  onClick={() => handleProcessOwnerPayoutNow(cr.id)}
                                  className="px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-[10px] font-bold transition cursor-pointer shadow-sm"
                                >
                                  Process Payout
                                </button>
                              ) : (
                                <span className="text-slate-300 text-[10px] select-none font-medium">—</span>
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
            {activeSection === "security" && (
              <div className="space-y-6 animate-in fade-in duration-150">
                
                {/* 1. Threat Monitor */}
                <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-4">
                  <div className="flex justify-between items-center border-b border-slate-100 pb-3 flex-wrap gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
                        <h3 className="text-xs font-bold uppercase tracking-widest text-indigo-600 font-mono">Security Shield</h3>
                      </div>
                      <p className="text-[10px] text-slate-400 mt-0.5">Threat monitoring and intrusion prevention.</p>
                    </div>
                    
                    <div className="flex items-center gap-0.5 bg-slate-900 p-1 rounded-lg text-xs font-mono font-bold text-white shrink-0">
                      <span className="px-2 text-slate-500 uppercase text-[9px]">THREAT:</span>
                      {(["LOW", "ELEVATED", "CRITICAL", "LOCKDOWN"] as const).map((level) => (
                        <button 
                          key={level}
                          onClick={() => setShieldThreatLevel(level)}
                          className={`px-2 py-0.5 rounded text-[10px] cursor-pointer font-extrabold transition ${shieldThreatLevel === level ? (level === "LOCKDOWN" ? "bg-red-700 animate-pulse" : level === "CRITICAL" ? "bg-rose-600" : level === "ELEVATED" ? "bg-amber-600" : "bg-emerald-600") : "text-slate-500 hover:text-slate-300"}`}
                        >
                          {level}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80 flex flex-col justify-between">
                      <span className="text-[9px] uppercase font-mono tracking-wider font-bold text-slate-400">Threat Level</span>
                      <span className={`text-sm font-bold font-mono mt-1 ${shieldThreatLevel === "LOCKDOWN" ? "text-red-700 animate-pulse" : shieldThreatLevel === "CRITICAL" ? "text-rose-600" : shieldThreatLevel === "ELEVATED" ? "text-amber-600" : "text-emerald-600"}`}>
                        {shieldThreatLevel}
                      </span>
                    </div>
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80 flex flex-col justify-between">
                      <span className="text-[9px] uppercase font-mono tracking-wider font-bold text-slate-400">Port</span>
                      <span className="text-xs font-bold font-mono text-slate-700 mt-1">TCP 3000 SSL</span>
                    </div>
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80 flex flex-col justify-between">
                      <span className="text-[9px] uppercase font-mono tracking-wider font-bold text-slate-400">Firewall</span>
                      <span className="text-xs font-bold text-slate-700 mt-1">TLS Proxy Active</span>
                    </div>
                  </div>

                  {/* Emergency broadcast */}
                  <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="space-y-0.5">
                      <span className="text-[10px] text-rose-600 block font-bold font-mono tracking-wider uppercase">Emergency Lockdown</span>
                      <h4 className="text-xs font-bold text-rose-900">Broadcast platform-wide security evacuation</h4>
                      <p className="text-[10px] text-rose-700/80 leading-normal">Enforces lockdown across all workspaces and terminates active sessions.</p>
                    </div>

                    <button
                      onClick={() => {
                        setAlarmActive(!alarmActive);
                        if (!alarmActive) {
                          setShieldThreatLevel("LOCKDOWN");
                          alert("Platform shifted to LOCKDOWN state.");
                        } else {
                          setShieldThreatLevel("LOW");
                          alert("Lockdown disarmed. Platform reverted to normal.");
                        }
                      }}
                      className={`px-4 py-2 rounded-xl text-xs font-semibold tracking-wider uppercase font-mono shadow-sm transition shrink-0 cursor-pointer ${
                        alarmActive 
                          ? "bg-rose-600 text-white animate-pulse" 
                          : "bg-rose-900 hover:bg-rose-800 text-white"
                      }`}
                    >
                      {alarmActive ? "Disarm Lockdown" : "Activate Lockdown"}
                    </button>
                  </div>
                </div>

                {/* 2. Security Protocols */}
                <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-4">
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 font-mono">Security Protocols</h3>
                    <p className="text-[10px] text-slate-400 mt-0.5">MFA enforcement, CORS, XSS sanitization, and DDoS protection.</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {Object.entries(securityModules).map(([key, value]) => {
                      let displayName = key.replace(/([A-Z])/g, ' $1').trim();
                      if (key === "twoFactorForce") displayName = "MFA Enforcement";
                      if (key === "corsMode") displayName = "CORS Protection";
                      if (key === "xssSanitizer") displayName = "XSS Sanitizer";
                      if (key === "sqliBlocker") displayName = "SQL Injection Blocker";
                      if (key === "ddosRateLimit") displayName = "DDoS Rate Limits";
                      if (key === "secureCookies") displayName = "Secure Cookies";

                      return (
                        <div key={key} className="bg-slate-50 border border-slate-200/80 rounded-xl p-4 flex items-center justify-between gap-3">
                          <div>
                            <span className="text-[9px] uppercase font-mono font-bold text-slate-400 block">{displayName}</span>
                            <span className="text-xs font-bold text-slate-700">{value ? "Active" : "Disabled"}</span>
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

                  <div className="bg-indigo-50 border border-indigo-200/70 p-3.5 rounded-xl">
                    <p className="text-[10px] text-indigo-800 leading-relaxed">
                      <strong>MFA Enforcement:</strong> Enabling hardware MFA shields all database access pathways. Admin and Owner credentials require authenticator keys before granting edit access.
                    </p>
                  </div>
                </div>

                {/* 3. IP Ban Registry */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 animate-in fade-in duration-100">
                  <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm md:col-span-4 space-y-4">
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 font-display">IP Ban Registry</h4>
                      <p className="text-[9.5px] text-slate-400 mt-0.5">Block malicious IPs before they reach the proxy layer.</p>
                    </div>

                    <div className="space-y-1.5 text-xs font-sans">
                      <label className="block text-[10px] font-mono uppercase font-bold text-slate-500">IP Address</label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="198.51.100.8"
                          value={newIpBan}
                          onChange={(e) => setNewIpBan(e.target.value)}
                          className="flex-1 bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-[11px] font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition"
                        />
                        <button
                          onClick={() => {
                            if (!newIpBan.trim()) return;
                            setBannedIps([...bannedIps, newIpBan.trim()]);
                            setNewIpBan("");
                            alert(`IP ${newIpBan} banned.`);
                          }}
                          className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-mono text-[10.5px] font-bold transition cursor-pointer shadow-sm"
                        >
                          Ban
                        </button>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-100">
                      <span className="text-[9px] uppercase font-mono font-bold text-slate-400 tracking-wider block mb-2">Banned IPs ({bannedIps.length})</span>
                      <div className="space-y-1 max-h-36 overflow-y-auto">
                        {bannedIps.length === 0 ? (
                          <p className="text-[10px] text-slate-300 font-mono text-center py-2">No bans</p>
                        ) : (
                          bannedIps.map((ip, idx) => (
                            <div key={idx} className="flex justify-between items-center bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-200/80 text-[10.5px] font-mono">
                              <span className="text-slate-700">{ip}</span>
                              <button
                                onClick={() => {
                                  setBannedIps(bannedIps.filter(item => item !== ip));
                                  alert(`IP ${ip} unbanned.`);
                                }}
                                className="text-slate-400 hover:text-rose-600 font-bold uppercase text-[9px] transition"
                              >
                                remove
                              </button>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </div>

                  {/* 4. Abuse Logs */}
                  <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm md:col-span-8 space-y-4">
                    <div className="flex justify-between items-center flex-wrap gap-2">
                      <div>
                        <h4 className="text-xs font-bold text-slate-900 font-display">Security Event Log</h4>
                        <p className="text-[9.5px] text-slate-400 mt-0.5">Anomalous activity, rate-limit triggers, and threat signals.</p>
                      </div>
                      <button
                        onClick={() => {
                          setAbuseLogs([]);
                          alert("Log cleared.");
                        }}
                        className="px-3 py-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-50 border border-slate-200 rounded-lg font-mono text-[9px] font-bold uppercase transition cursor-pointer"
                      >
                        Clear Log
                      </button>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-left font-sans text-xs border-collapse">
                        <thead>
                          <tr className="border-b border-slate-200 text-[9px] font-bold font-mono tracking-wider text-slate-400 uppercase bg-slate-50/50">
                            <th className="py-2 px-3 pb-2.5">Time</th>
                            <th className="py-2 px-3 pb-2.5">Source IP</th>
                            <th className="py-2 px-3 pb-2.5">Event</th>
                            <th className="py-2 px-3 pb-2.5">Severity</th>
                            <th className="py-2 px-3 pb-2.5 text-right">Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {abuseLogs.length === 0 ? (
                            <tr>
                              <td colSpan={5} className="py-8 text-center text-slate-300 font-mono text-[10.5px]">
                                No security events
                              </td>
                            </tr>
                          ) : (
                            abuseLogs.map((log) => (
                              <tr key={log.id} className="hover:bg-slate-50/80 text-[10.5px] transition">
                                <td className="py-3 px-3 font-mono text-slate-400 text-[10px] whitespace-nowrap">{log.date}</td>
                                <td className="py-3 px-3 font-mono font-semibold text-slate-700">{log.ip}</td>
                                <td className="py-3 px-3 text-slate-800">{log.event}</td>
                                <td className="py-3 px-3">
                                  <span className={`px-1.5 py-0.5 rounded font-mono font-bold text-[8.5px] border ${
                                    log.threat === "CRITICAL"
                                      ? "bg-rose-50 text-rose-600 border-rose-200"
                                      : log.threat === "HIGH"
                                        ? "bg-amber-50 text-amber-600 border-amber-200"
                                        : "bg-blue-50 text-blue-600 border-blue-200"
                                  }`}>
                                    {log.threat}
                                  </span>
                                </td>
                                <td className="py-3 px-3 text-right font-medium text-slate-400 text-[10px] max-w-xs truncate" title={log.actionHandled}>
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
                <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-100 pb-3">
                    <div>
                      <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 font-mono">Audit Log</h3>
                      <p className="text-[10px] text-slate-400 mt-0.5">Role changes, security events, and tenant actions.</p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <select
                        value={logsFilterAction}
                        onChange={(e) => setLogsFilterAction(e.target.value)}
                        className="bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-700 cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                      >
                        <option value="ALL">All Events</option>
                        <option value="SECURITY_VIOLATION">Security Violations</option>
                        <option value="ROLE_UPGRADE">Role Changes</option>
                        <option value="COURSE_CREATED">Course Created</option>
                        <option value="MIGRATION_AUTO">Migrations</option>
                      </select>

                      <input
                        type="text"
                        placeholder="Search logs..."
                        value={logsSearch}
                        onChange={(e) => setLogsSearch(e.target.value)}
                        className="border border-slate-200 bg-white rounded-lg px-3 py-1.5 text-xs w-full sm:w-56 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition"
                      />
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs min-w-max border-collapse">
                      <thead>
                        <tr className="border-b border-slate-200 text-slate-400 font-bold font-mono text-[9.5px] uppercase tracking-wider bg-slate-50/50">
                          <th className="py-2.5 px-3">Timestamp</th>
                          <th className="py-2.5 px-3">Actor</th>
                          <th className="py-2.5 px-3">Action</th>
                          <th className="py-2.5 px-3">Workspace</th>
                          <th className="py-2.5 px-3">Details</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {filteredLogs.length === 0 ? (
                          <tr>
                            <td colSpan={5} className="py-8 text-center text-slate-300 font-mono">
                              No logs found
                            </td>
                          </tr>
                        ) : (
                          filteredLogs.slice().reverse().map((log: any) => (
                            <tr key={log.id} className="hover:bg-slate-50/80 text-[10.5px] transition">
                              <td className="py-2.5 px-3 font-mono text-slate-400 whitespace-nowrap">
                                {log.createdAt ? new Date(log.createdAt).toUTCString() : "—"}
                              </td>
                              <td className="py-2.5 px-3 font-semibold text-slate-800">
                                {log.userName || "System"}
                              </td>
                              <td className="py-2.5 px-3">
                                <span className={`px-2 py-0.5 rounded text-[8.5px] font-mono uppercase font-bold border ${
                                  log.action === "SECURITY_VIOLATION" 
                                    ? "bg-rose-50 text-rose-600 border-rose-200" 
                                    : log.action.includes("ROLE") || log.action.includes("UPGRADE")
                                      ? "bg-amber-50 text-amber-600 border-amber-200"
                                      : "bg-indigo-50 text-indigo-600 border-indigo-200"
                                }`}>
                                  {log.action}
                                </span>
                              </td>
                              <td className="py-2.5 px-3 font-mono text-slate-500 text-[10px]">
                                {log.workspaceId || "System"}
                              </td>
                              <td className="py-2.5 px-3 text-slate-500 max-w-md truncate" title={log.details}>
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
            {/* SECTION 13: SYSTEM SETTINGS */}
            {/* ========================================================== */}
            {activeSection === "settings" && (
              <div className="space-y-6 animate-in fade-in duration-150">
                <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-4">
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 font-mono">System Settings</h3>
                    <p className="text-[10px] text-slate-400 mt-0.5">Region, database, and backup configuration.</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-1">
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-slate-400 block uppercase font-mono">Region</label>
                      <select
                        value={deploymentRegion}
                        onChange={(e) => setDeploymentRegion(e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs font-bold font-mono text-slate-700 cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition"
                      >
                        <option value="gcp-us-central1">US Central (Iowa)</option>
                        <option value="gcp-asia-southeast1">Asia Pacific (Singapore)</option>
                        <option value="gcp-europe-west3">Europe (Frankfurt)</option>
                        <option value="gcp-local-sandbox">Local Sandbox</option>
                      </select>
                    </div>

                    <div className="space-y-3 flex flex-col justify-end">
                      <div className="flex items-center justify-between text-xs py-1.5 bg-slate-50 p-2.5 rounded-lg border border-slate-200/80">
                        <div>
                          <span className="font-bold text-slate-900 block">Debug Logging</span>
                          <span className="text-[10px] text-slate-400 leading-none">Verbose console output in memory</span>
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

                  <div className="pt-2 border-t border-slate-100 space-y-3">
                    <h4 className="text-xs font-bold text-slate-900 font-mono">Backup Recovery Keys</h4>
                    <div className="bg-slate-900 rounded-xl p-4 font-mono text-[10px] text-slate-300 space-y-2 relative overflow-hidden">
                      <div className="flex justify-between items-center text-slate-500 border-b border-slate-800 pb-2">
                        <span className="text-[8.5px] uppercase font-bold tracking-wider">Recovery Keys</span>
                        <span>SHA-256 Encrypted</span>
                      </div>
                      <div>
                        <span>KEY_A: </span><code className="text-emerald-400 font-bold">SHA256::f23b2c...a891</code>
                      </div>
                      <div>
                        <span>KEY_B: </span><code className="text-emerald-400 font-bold">SHA256::e910bd...d451</code>
                      </div>
                      <p className="text-slate-500 text-[9.5px] leading-relaxed pt-1.5 font-sans">
                        Auto-generated on startup for encrypted database recovery. Keep secure.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

          </div>

      </div>

    </div>
  );
}
