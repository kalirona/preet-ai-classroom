import React, { useState, useEffect } from "react";
import { Award, FileText, CheckCircle, Clock, Search } from "lucide-react";

interface CertificatesViewProps {
  workspaceId: string;
}

export default function CertificatesView({ workspaceId }: CertificatesViewProps) {
  const [certificates, setCertificates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (!workspaceId) return;
    setLoading(true);
    fetch(`/api/workspace/${workspaceId}/certificates`)
      .then((r) => r.json())
      .then((data) => {
        if (data.certificates) setCertificates(data.certificates);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [workspaceId]);

  const filtered = certificates.filter((c: any) =>
    !search || c.student_name?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900">Certificates</h1>
        <p className="text-sm text-gray-500 mt-1">Issue and manage course completion certificates</p>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: "Total Issued", value: certificates.length, icon: Award, color: "text-indigo-600 bg-indigo-100" },
          { label: "Pending", value: certificates.filter((c: any) => !c.issued).length, icon: Clock, color: "text-amber-600 bg-amber-100" },
          { label: "This Month", value: certificates.filter((c: any) => c.issued_at && new Date(c.issued_at) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)).length, icon: CheckCircle, color: "text-emerald-600 bg-emerald-100" },
        ].map((stat) => (
          <div key={stat.label} className="bg-white rounded-2xl border border-gray-200 p-5">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${stat.color} mb-3`}>
              <stat.icon className="w-4 h-4" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
            <p className="text-xs text-gray-500 mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-3 mb-4">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by student name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-300"
          />
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50">
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3">Student</th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3">Course</th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3">Issued</th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-12 text-center">
                    <Award className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                    <p className="text-sm text-gray-500">No certificates found</p>
                  </td>
                </tr>
              ) : (
                filtered.map((c: any, i: number) => (
                  <tr key={c.id || i} className="border-b border-gray-50 hover:bg-gray-50/50">
                    <td className="px-4 py-3 font-medium text-gray-900">{c.student_name || "Unknown"}</td>
                    <td className="px-4 py-3 text-gray-600">{c.course_name || "—"}</td>
                    <td className="px-4 py-3 text-gray-600">{c.issued_at ? new Date(c.issued_at).toLocaleDateString() : "—"}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${
                        c.issued ? "text-emerald-600 bg-emerald-50" : "text-amber-600 bg-amber-50"
                      }`}>
                        {c.issued ? <CheckCircle className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                        {c.issued ? "Issued" : "Pending"}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
