import React, { useState, useEffect } from "react";
import { 
  Database, ShieldCheck, CheckCircle, RefreshCw, AlertCircle, Copy, Terminal, 
  HelpCircle, ExternalLink, ShieldAlert, KeyRound, HardDrive, Cpu, Check, ArrowRight, Lock
} from "lucide-react";
import { User } from "../types";

interface CloudPanelDashboardProps {
  currentUser: User | null;
}

export default function CloudPanelDashboard({ currentUser }: CloudPanelDashboardProps) {
  const [status, setStatus] = useState<{
    configured: boolean;
    connected: boolean;
    usersCount: number;
    host?: string;
    database?: string;
    message: string;
  } | null>(null);

  const [isLoadingStatus, setIsLoadingStatus] = useState(true);
  const [isMigrating, setIsMigrating] = useState(false);
  const [migrationRes, setMigrationRes] = useState<{ success: boolean; message: string } | null>(null);
  const [copiedSql, setCopiedSql] = useState(false);

  // Connection Ping Loader from our brand new CloudPanel status endpoint
  async function checkConnection() {
    setIsLoadingStatus(true);
    try {
      const res = await fetch("/api/cloudpanel/status");
      const data = await res.json();
      setStatus(data);
    } catch (err) {
      console.error(err);
      setStatus({
        configured: false,
        connected: false,
        usersCount: 0,
        message: "Failed to query the backend CloudPanel MySQL controller. Database connection handshake timed out."
      });
    } finally {
      setIsLoadingStatus(false);
    }
  }

  // Handle Action Trigger Re-seeding / Migration of Local db.json to CloudPanel Server
  async function triggerForceMigrate() {
    if (!window.confirm("Warning: This will clear your CloudPanel MySQL project's users, workspaces, members, posts, and courses tables, and completely renew them based on your local db.json. Continue?")) {
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
        await checkConnection();
      } else {
        setMigrationRes({ success: false, message: data.error || "Migration failed internally on the MySQL server." });
      }
    } catch (err: any) {
      setMigrationRes({ success: false, message: err.message || "Network error. Server was unreachable." });
    } finally {
      setIsMigrating(false);
    }
  }

  useEffect(() => {
    checkConnection();
  }, []);

  const handleCopySchemaCommand = () => {
    navigator.clipboard.writeText("cat /cloudpanel/schema.sql");
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2000);
  };

  return (
    <div className="h-full flex flex-col bg-[#F8F9FB] overflow-y-auto selection:bg-indigo-150" id="cloudpanel-console">
      <div className="max-w-5xl w-full mx-auto p-4 sm:p-6 space-y-6">
        
        {/* Banner Alert */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-indigo-900/40 text-white rounded-3xl p-6 shadow-sm relative overflow-hidden">
          <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 w-48 h-48 bg-white/5 rounded-full blur-xl pointer-events-none" />
          <span className="text-[9px] uppercase font-mono bg-indigo-600 text-indigo-50 border border-indigo-500/30 px-2.5 py-1 rounded-full font-bold inline-flex items-center gap-1.5 shadow-sm">
            <Database className="w-3 h-3" /> CloudPanel MySQL / MariaDB Suite
          </span>
          <h2 className="text-lg font-bold font-display mt-3 tracking-tight">CloudPanel Core SQL Database Controller</h2>
          <p className="text-[11px] text-indigo-200/90 max-w-xl mt-1 leading-relaxed">
            Monitor and administer your corporate MySQL schema directly from the application panel. Realize performance gains, safe multi-tenant filtering, and total server-side query safety.
          </p>
        </div>

        {/* Sync Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Main Status */}
          <div className="bg-white rounded-2xl border border-gray-150 p-5 shadow-sm flex flex-col justify-between">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[9px] text-gray-400 block uppercase font-bold tracking-wider font-mono">Integration State</span>
                <span className="text-sm font-bold text-gray-800 mt-1 block font-display">
                  {isLoadingStatus ? "Verifying..." : status?.connected ? "CloudPanel Connected" : "Local JSON Fallback"}
                </span>
              </div>
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                isLoadingStatus ? "bg-gray-50 text-gray-400 animate-spin" : status?.connected ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600"
              }`}>
                {isLoadingStatus ? <RefreshCw className="w-4 h-4" /> : status?.connected ? <ShieldCheck className="w-4.5 h-4.5" /> : <AlertCircle className="w-4.5 h-4.5" />}
              </div>
            </div>
            
            <div className="border-t border-gray-100 pt-3 mt-4 flex items-center justify-between text-[10px]">
              <span className="text-gray-500 font-medium">SQL Engine Layer:</span>
              <span className={`px-2 py-0.5 rounded font-mono font-bold ${
                status?.connected ? "bg-emerald-50 text-emerald-700 border border-emerald-100" : "bg-amber-50 text-amber-700 border border-amber-100"
              }`}>
                {status?.connected ? "CLOUDPANEL MYSQL" : "MOCK LOCAL DB"}
              </span>
            </div>
          </div>

          {/* Database Info */}
          <div className="bg-white rounded-2xl border border-gray-150 p-5 shadow-sm flex flex-col justify-between">
            <div>
              <span className="text-[9px] text-gray-400 block uppercase font-bold tracking-wider font-mono">Row Index Status</span>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-xl font-extrabold text-gray-950 font-sans tracking-tight">
                  {isLoadingStatus ? "..." : status?.usersCount || 0}
                </span>
                <span className="text-[10px] text-gray-400 font-medium font-sans">synchronized users</span>
              </div>
            </div>

            <div className="border-t border-gray-100 pt-3 mt-4 flex items-center justify-between text-[10px]">
              <span className="text-gray-500 font-medium font-mono">Security Model:</span>
              <span className="text-emerald-700 font-bold flex items-center gap-1 font-mono">
                <Lock className="w-3 h-3" /> ESCAPED SQL QUERY PARAMS
              </span>
            </div>
          </div>

          {/* Connected Instance */}
          <div className="bg-white rounded-2xl border border-gray-150 p-5 shadow-sm flex flex-col justify-between">
            <div>
              <span className="text-[9px] text-gray-400 block uppercase font-bold tracking-wider font-mono">Server Address & Database</span>
              <span className="text-[10px] font-mono font-medium text-gray-600 block mt-1 py-1 px-1.5 bg-gray-50 rounded select-all break-all overflow-hidden max-h-12 border">
                {isLoadingStatus ? "Loading..." : status?.host ? `${status.host} (DB: ${status.database})` : "Not configured (Using file system db.json)"}
              </span>
            </div>

            <button 
              onClick={checkConnection}
              className="mt-3 text-[10px] font-bold text-indigo-600 hover:text-indigo-800 transition py-1.5 border border-indigo-100 hover:bg-indigo-50/50 rounded-xl flex items-center justify-center gap-1 cursor-pointer"
            >
              <RefreshCw className="w-3 h-3" /> Refresh Diagnostics
            </button>
          </div>
        </div>

        {/* Action Panel & Guide */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Action Box */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-150 p-6 space-y-5 shadow-sm">
            <h3 className="text-xs font-bold text-gray-900 tracking-tight uppercase font-mono">Tenant Data Sync Controls</h3>
            <p className="text-[11px] text-gray-500 leading-relaxed font-sans">
              Connect to your customized CloudPanel servers. Database operations are completely isolated and mapped per <code>workspace_id</code> for each workspace tenant, preventing workspace creators and normal users from crossing domains.
            </p>

            {migrationRes && (
              <div className={`p-3 border rounded-xl text-xs flex items-center gap-2 ${
                migrationRes.success ? "bg-emerald-50 border-emerald-250 text-emerald-800" : "bg-rose-50 border-rose-250 text-rose-800"
              }`}>
                {migrationRes.success ? <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" /> : <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />}
                <span className="font-semibold">{migrationRes.message}</span>
              </div>
            )}

            <div className="p-4 bg-slate-50 border rounded-2xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h4 className="text-[11px] font-bold text-gray-900 font-display">Synchronize local sandbox database</h4>
                <p className="text-[10px] text-gray-400 mt-0.5">Truncates MySQL database structures and re-syncs from standard db.json</p>
              </div>
              <button
                onClick={triggerForceMigrate}
                disabled={isMigrating || !status?.configured}
                className={`py-2 px-4 rounded-xl text-xs font-bold font-display flex items-center justify-center gap-2 transition shrink-0 ${
                  !status?.configured 
                    ? "bg-gray-100 text-gray-400 border border-gray-200 cursor-not-allowed" 
                    : "bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm cursor-pointer"
                }`}
              >
                {isMigrating ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
                {isMigrating ? "Syncing Schema..." : "Force MySQL Hydration"}
              </button>
            </div>

            <div className="border-t border-gray-100 pt-5 space-y-4">
              <h4 className="text-xs font-bold text-gray-900 font-mono">Prerequisite: Apply Schema in CloudPanel's phpMyAdmin / SQL</h4>
              <p className="text-[11px] text-gray-500 leading-relaxed font-sans">
                Make sure you create the tables in your database with our secure structure. Click below to copy the print schema command or open <code>/cloudpanel/schema.sql</code> inside the file tree:
              </p>

              <div className="relative">
                <div className="bg-slate-900 text-slate-100 rounded-2xl p-4 font-mono text-[10px] overflow-x-auto shadow-sm border border-slate-950">
                  <div className="flex justify-between items-center text-slate-400 border-b border-slate-800 pb-2 mb-2">
                    <span className="text-[9px] uppercase font-bold text-slate-500 tracking-wider flex items-center gap-1">
                      <Terminal className="w-3 h-3" /> Local Schema Source
                    </span>
                    <button 
                      onClick={handleCopySchemaCommand}
                      className="hover:text-white transition p-1 hover:bg-slate-800 rounded font-bold text-[9px] cursor-pointer flex items-center gap-1.5"
                    >
                      {copiedSql ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      {copiedSql ? "Copied Command!" : "Copy Command"}
                    </button>
                  </div>
                  <code>$ cat /cloudpanel/schema.sql</code>
                  <div className="mt-3 text-slate-400 leading-relaxed text-[9.5px] font-sans">
                    Open `/cloudpanel/schema.sql` inside your workspace code editor, copy the entire content, paste it directly into phpMyAdmin's <strong>SQL Editor</strong> query box, and click <strong>Go / Run</strong>.
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* Configuration Tutorial Panel */}
          <div className="bg-white rounded-2xl border border-gray-150 p-5 shadow-sm space-y-4">
            <h3 className="text-xs font-bold text-gray-905 tracking-tight uppercase font-mono flex items-center gap-1.5">
              <ShieldAlert className="w-4 h-4 text-indigo-600" /> Security Instructions
            </h3>
            
            <div className="space-y-4 text-[11px] text-gray-600 leading-relaxed font-sans">
              <div className="p-3 bg-indigo-50 border border-indigo-120 rounded-xl space-y-1.5">
                <span className="font-bold text-indigo-900 block text-[10px] uppercase font-mono tracking-wider">CloudPanel Parameters</span>
                <p className="text-[10px] text-indigo-950/80 leading-relaxed">
                  Open the <strong>Secrets Settings panel</strong> in the AI Studio environment and append the following variables:
                </p>
                <div className="space-y-1 pt-1 font-mono text-[9px] text-indigo-900">
                  <span className="block bg-white/70 px-1 py-0.5 rounded border">DB_HOST=127.0.0.1</span>
                  <span className="block bg-white/70 px-1 py-0.5 rounded border">DB_PORT=3306</span>
                  <span className="block bg-white/70 px-1 py-0.5 rounded border">DB_USER=cloudpanel_db_username</span>
                  <span className="block bg-white/70 px-1 py-0.5 rounded border">DB_PASSWORD=your_secure_password</span>
                  <span className="block bg-white/70 px-1 py-0.5 rounded border">DB_NAME=cloudpanel_database_name</span>
                </div>
              </div>

              <div className="space-y-2 pt-1 border-t border-gray-100">
                <span className="font-bold text-gray-900 text-xs block font-display">1. Parameters Sanitization</span>
                <p className="text-[10.5px]">
                  Unlike fragile concatenated SQL requests (e.g., <code>"WHERE user_id = " + input</code>), the backend utilizes <strong>native parameterized commands</strong>:
                </p>
                <div className="p-2 bg-slate-900 text-emerald-400 rounded-xl font-mono text-[9px] border">
                  SELECT * FROM posts WHERE id = ?;
                </div>
              </div>

              <div className="space-y-2 pt-2 border-t border-gray-100">
                <span className="font-bold text-gray-900 text-xs block font-display">2. Multi-tenant Separation Rules</span>
                <p className="text-[10.5px]">
                  All courses, direct messaging flows, group chat channels, analytics calculations, and billing histories filter strictly under the client's current <code>workspace_id</code> domain verification check. This prevents lateral traversal of creator analytics.
                </p>
              </div>

            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
