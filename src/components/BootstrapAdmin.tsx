import React, { useState, useEffect } from "react";
import { Shield, AlertTriangle, CheckCircle } from "lucide-react";

interface Props {
  currentUser: any;
  onAdminClaimed: (user: any) => void;
}

export default function BootstrapAdmin({ currentUser, onAdminClaimed }: Props) {
  const [checking, setChecking] = useState(true);
  const [canClaim, setCanClaim] = useState(false);
  const [claiming, setClaiming] = useState(false);
  const [error, setError] = useState("");
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (!currentUser) return;
    if (currentUser.platformRole === "super_admin") {
      setChecking(false);
      return;
    }
    fetch("/api/users")
      .then((r) => r.json())
      .then((data) => {
        const hasAdmin = (data.users || []).some((u: any) => u.platformRole === "super_admin");
        setCanClaim(!hasAdmin);
      })
      .catch(() => {})
      .finally(() => setChecking(false));
  }, [currentUser]);

  const handleClaim = async () => {
    setClaiming(true);
    setError("");
    try {
      const res = await fetch("/api/auth/claim-admin", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      onAdminClaimed(data.user);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setClaiming(false);
    }
  };

  if (checking || dismissed || !canClaim || currentUser?.platformRole === "super_admin") return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 max-w-sm bg-indigo-600 text-white rounded-2xl shadow-2xl p-5 border border-indigo-400 animate-in slide-in-from-bottom-4 duration-300">
      <div className="flex items-start gap-3">
        <Shield className="w-6 h-6 mt-0.5 shrink-0" />
        <div className="space-y-2">
          <h3 className="font-bold text-sm">Platform Not Configured</h3>
          <p className="text-indigo-100 text-xs leading-relaxed">
            No Super Admin exists in this system. Claim admin access to manage workspaces, users, and platform settings.
          </p>
          {error && (
            <div className="flex items-center gap-1.5 text-xs text-red-200 bg-red-500/20 px-3 py-1.5 rounded-lg">
              <AlertTriangle className="w-3.5 h-3.5" />
              {error}
            </div>
          )}
          <div className="flex gap-2 pt-1">
            <button
              onClick={handleClaim}
              disabled={claiming}
              className="px-4 py-2 bg-white text-indigo-700 rounded-xl text-xs font-bold hover:bg-indigo-50 transition disabled:opacity-50 cursor-pointer"
            >
              {claiming ? "Claiming..." : "Claim Super Admin"}
            </button>
            <button
              onClick={() => setDismissed(true)}
              className="px-3 py-2 text-indigo-200 hover:text-white rounded-xl text-xs font-medium transition cursor-pointer"
            >
              Later
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
