import { useState } from "react";
import { Community } from "../../types";
import { CheckCircle, Plus, RefreshCw } from "lucide-react";

interface PlatformWorkspacesProps {
  communities: Community[];
}

export default function PlatformWorkspaces({ communities }: PlatformWorkspacesProps) {
  const [simWsName, setSimWsName] = useState("");
  const [simWsSubdomain, setSimWsSubdomain] = useState("");
  const [simWsPrice, setSimWsPrice] = useState(49);
  const [simWsEmail, setSimWsEmail] = useState("");
  const [simWsSuccessMsg, setSimWsSuccessMsg] = useState("");
  const [simIsProvisioning, setSimIsProvisioning] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; msg: string } | null>(null);

  const showFeedback = (type: "success" | "error", msg: string) => {
    setFeedback({ type, msg });
    setTimeout(() => setFeedback(null), 2500);
  };

  const handleSimulateWorkspaceProvision = (e: React.FormEvent) => {
    e.preventDefault();
    if (!simWsName || !simWsSubdomain || !simWsEmail) {
      showFeedback("error", "Please fill all fields to provision.");
      return;
    }
    setSimIsProvisioning(true);
    setSimWsSuccessMsg("");

    setTimeout(() => {
      setSimIsProvisioning(false);
      setSimWsSuccessMsg(`Workspace "${simWsName}" provisioned at ${simWsSubdomain.toLowerCase()}.skoolsaas.pro. Invite sent to ${simWsEmail}.`);
      setSimWsName("");
      setSimWsSubdomain("");
      setSimWsEmail("");
    }, 1500);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {feedback && (
        <div className={`flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium ${
          feedback.type === "success" ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-red-50 text-red-700 border border-red-200"
        }`}>
          {feedback.type === "success" ? <CheckCircle className="w-4 h-4" /> : null}
          {feedback.msg}
        </div>
      )}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Workspace List */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-4">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 font-mono">Workspaces</h3>
            <p className="text-[10px] text-slate-400 mt-0.5">Manage tenant namespaces and database links.</p>
          </div>

          <div className="divide-y divide-slate-100 max-h-96 overflow-y-auto pr-1">
            {(communities ?? []).map((comm) => (
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
                    onClick={() => showFeedback("success", `Health check for "${comm.name}" passed.`)}
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
  );
}
