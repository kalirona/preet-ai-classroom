import React, { useState } from "react";
import { User, Community } from "../types";
import { 
  DollarSign, Receipt, CreditCard, ChevronRight, Plus, 
  Search, Filter, Sparkles, Send, CheckCircle, Smartphone, Globe
} from "lucide-react";

interface CreatorSalesViewProps {
  currentUser: User | null;
  activeCommunity: Community | null;
}

export default function CreatorSalesView({
  currentUser,
  activeCommunity
}: CreatorSalesViewProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [invoiceName, setInvoiceName] = useState("");
  const [invoiceEmail, setInvoiceEmail] = useState("");
  const [invoiceDesc, setInvoiceDesc] = useState("Custom Whiteboard Coaching Session");
  const [invoiceAmount, setInvoiceAmount] = useState(149);
  const [showInvoiceForm, setShowInvoiceForm] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Initial sales logs
  const [salesHistory, setSalesHistory] = useState([
    { id: "tx-491a", name: "Sarah Connor", email: "sarahc@sky.net", desc: `${activeCommunity?.name || "SaaS Pro"} Premium Monthly Seat`, amount: 49, date: "2026-05-28T18:32:00Z", status: "CLEARED" },
    { id: "tx-491b", name: "John Doe", email: "john@cyberdyne.org", desc: `${activeCommunity?.name || "SaaS Pro"} Premium Monthly Seat`, amount: 49, date: "2026-05-27T10:14:00Z", status: "CLEARED" },
    { id: "tx-491c", name: "Jane Foster", email: "foster@asgard.com", desc: "Private API Consultation (Add-on)", amount: 250, date: "2026-05-26T22:45:00Z", status: "CLEARED" },
    { id: "tx-491d", name: "Peter Parker", email: "pete@dailybugle.com", desc: `${activeCommunity?.name || "SaaS Pro"} Full Classroom Season Pass`, amount: 199, date: "2026-05-25T14:20:00Z", status: "CLEARED" },
    { id: "tx-491e", name: "Bruce Wayne", email: "gotham@wayne.corp", desc: "Ultimate Lifetime Masterclass Accelerator Bundle", amount: 999, date: "2026-05-24T05:11:00Z", status: "CLEARED" },
  ]);

  const handleCreateSimulatedInvoice = (e: React.FormEvent) => {
    e.preventDefault();
    if (!invoiceName || !invoiceEmail) return;

    const newTx = {
      id: `tx-${Math.random().toString(36).substring(2, 6)}`,
      name: invoiceName,
      email: invoiceEmail,
      desc: invoiceDesc,
      amount: Number(invoiceAmount),
      date: new Date().toISOString(),
      status: "CLEARED"
    };

    setSalesHistory([newTx, ...salesHistory]);
    setInvoiceName("");
    setInvoiceEmail("");
    setShowInvoiceForm(false);
    
    setToastMessage(`💳 Custom simulated invoice of $${invoiceAmount} sent to ${invoiceEmail} & successfully cleared in sandbox!`);
    setTimeout(() => setToastMessage(null), 5000);
  };

  // Metric computations
  const totalRawSales = salesHistory.reduce((sum, item) => sum + item.amount, 0);
  const platformFee = Number((totalRawSales * 0.02).toFixed(2)); // Skool/Kajabi SaaS cut
  const creatorPayout = Number((totalRawSales - platformFee).toFixed(2));
  const avgTicket = Number((totalRawSales / salesHistory.length).toFixed(2));

  const filteredSales = salesHistory.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.desc.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-4 sm:p-6 space-y-6 overflow-y-auto h-full bg-[#F8F9FB]" id="ws-creator-sales-view">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold font-display text-gray-900 tracking-tight flex items-center gap-2">
            <Receipt className="w-5 h-5 text-indigo-650" />
            Workspace Sales & Revenue Dashboard
          </h1>
          <p className="text-xs text-gray-450 mt-0.5">Simulate invoice clearings, review subscription payouts, and analyze database transactions.</p>
        </div>

        <button 
          onClick={() => setShowInvoiceForm(!showInvoiceForm)}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition cursor-pointer flex items-center gap-1.5 shadow-sm self-start sm:self-center"
        >
          <Plus className="w-4 h-4" />
          Send Custom Invoice
        </button>
      </div>

      {toastMessage && (
        <div className="bg-emerald-50 border border-emerald-250 text-emerald-850 p-4 rounded-2xl text-xs font-medium flex items-center gap-2.5 shadow-sm animate-in fade-in zoom-in-95 duration-150">
          <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* INVOICE FORM POPOVER */}
      {showInvoiceForm && (
        <div className="bg-white border border-[#E5E7EB] rounded-3xl p-5 shadow-md max-w-xl animate-in slide-in-from-top-4 duration-200">
          <div className="flex justify-between items-center border-b border-gray-100 pb-2.5 mb-4">
            <span className="text-xs font-extrabold uppercase tracking-wide text-gray-800 font-mono flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
              Simulate Send Live Invoice
            </span>
            <button 
              onClick={() => setShowInvoiceForm(false)} 
              className="text-xs text-gray-400 hover:text-gray-600 font-bold"
            >
              Cancel
            </button>
          </div>

          <form onSubmit={handleCreateSimulatedInvoice} className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] uppercase font-mono font-bold text-gray-400 mb-1">Customer/Student Name</label>
                <input 
                  type="text" 
                  value={invoiceName} 
                  onChange={(e) => setInvoiceName(e.target.value)} 
                  placeholder="e.g. Clark Kent"
                  className="w-full border border-gray-200 rounded-xl p-2.5 text-xs bg-gray-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-600"
                  required 
                />
              </div>
              <div>
                <label className="block text-[10px] uppercase font-mono font-bold text-gray-400 mb-1">Student Contact Email</label>
                <input 
                  type="email" 
                  value={invoiceEmail} 
                  onChange={(e) => setInvoiceEmail(e.target.value)} 
                  placeholder="clark@dailyplanet.com"
                  className="w-full border border-gray-200 rounded-xl p-2.5 text-xs bg-gray-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-600"
                  required 
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] uppercase font-mono font-bold text-gray-400 mb-1">Description of Service</label>
              <input 
                type="text" 
                value={invoiceDesc} 
                onChange={(e) => setInvoiceDesc(e.target.value)} 
                placeholder="Core SaaS Consulting Package"
                className="w-full border border-gray-200 rounded-xl p-2.5 text-xs bg-gray-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-600"
                required 
              />
            </div>

            <div>
              <label className="block text-[10px] uppercase font-mono font-bold text-gray-400 mb-1">Invoice Price ($ USD)</label>
              <input 
                type="number" 
                value={invoiceAmount} 
                onChange={(e) => setInvoiceAmount(Number(e.target.value))} 
                min={1}
                className="w-full border border-gray-200 rounded-xl p-2.5 text-xs bg-gray-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-600"
                required 
              />
            </div>

            <button 
              type="submit" 
              className="w-full py-2 bg-[#0F172A] hover:bg-black text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
            >
              <Send className="w-3.5 h-3.5" />
              Simulate Payment Clearing Log
            </button>
          </form>
        </div>
      )}

      {/* METRIC CARD BENTO BANNER */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        
        <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm">
          <span className="block text-[9px] uppercase font-mono tracking-widest text-slate-400 font-extrabold">Total Gross Sales</span>
          <div className="text-lg sm:text-2xl font-black text-slate-900 mt-1 font-display">
            ${totalRawSales.toLocaleString()}
          </div>
          <span className="text-[10px] text-gray-400 font-mono mt-0.5 block">Cleared Transactions</span>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm">
          <span className="block text-[9px] uppercase font-mono tracking-widest text-slate-400 font-extrabold">Host Platform Fee (2%)</span>
          <div className="text-lg sm:text-2xl font-black text-rose-600 mt-1 font-display">
            -${platformFee.toLocaleString()}
          </div>
          <span className="text-[10px] text-gray-400 font-mono mt-0.5 block">SaaS Engine Maintenance</span>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm">
          <span className="block text-[9px] uppercase font-mono tracking-widest text-slate-300 font-extrabold bg-indigo-900 text-white px-1.5 py-0.5 rounded w-max">Creator Net Payout</span>
          <div className="text-lg sm:text-2xl font-black text-emerald-600 mt-1 font-display">
            ${creatorPayout.toLocaleString()}
          </div>
          <span className="text-[10px] text-gray-400 font-mono mt-0.5 block">Routed to bank account</span>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm">
          <span className="block text-[9px] uppercase font-mono tracking-widest text-slate-400 font-extrabold">Avg Transaction Ticket</span>
          <div className="text-lg sm:text-2xl font-black text-slate-900 mt-1 font-display">
            ${avgTicket.toLocaleString()}
          </div>
          <span className="text-[10px] text-gray-400 font-mono mt-0.5 block">Basket Valuation</span>
        </div>

      </div>

      {/* SALES HISTORY GRID TABLE */}
      <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden">
        
        {/* Table Search & Filter Bar */}
        <div className="p-4 border-b border-gray-150 bg-gray-50/50 flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="relative w-full sm:max-w-xs">
            <span className="absolute left-3 top-2.5 text-gray-400">
              <Search className="w-4 h-4" />
            </span>
            <input 
              type="text" 
              value={searchTerm} 
              onChange={(e) => setSearchTerm(e.target.value)} 
              placeholder="Search customers or invoice items..." 
              className="w-full pl-9 pr-4 py-1.5 bg-white border border-gray-200 rounded-xl text-xs focus:ring-1 focus:ring-indigo-650 focus:outline-none placeholder:text-gray-400 text-gray-700"
            />
          </div>
          <div className="flex items-center gap-1.5 text-xs font-bold text-gray-500">
            <Filter className="w-3.5 h-3.5 text-gray-400" />
            <span>Sandbox Mode: Auto-Clearing Active</span>
          </div>
        </div>

        {/* Real Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 text-gray-400 uppercase font-mono border-b border-gray-150 text-[10px] tracking-wider font-extrabold">
                <th className="py-3 px-4">Transaction ID</th>
                <th className="py-3 px-4">Customer Name / Contact</th>
                <th className="py-3 px-4">Item Sold</th>
                <th className="py-3 px-4 text-right">Raw price</th>
                <th className="py-3 px-4 text-center">Date</th>
                <th className="py-3 px-4 text-right">Payout Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 font-medium">
              {filteredSales.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-gray-400 font-medium font-sans">
                    No transactions discoverable based on filters.
                  </td>
                </tr>
              ) : (
                filteredSales.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4 font-mono text-[11px] text-gray-400 select-all font-semibold">
                      {s.id}
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-bold text-slate-800 block text-xs">{s.name}</span>
                      <span className="text-gray-400 text-[10px] font-mono leading-none">{s.email}</span>
                    </td>
                    <td className="py-3 px-4 text-slate-700 text-xs font-semibold">
                      {s.desc}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-slate-800">
                      ${s.amount.toFixed(2)}
                    </td>
                    <td className="py-3 px-4 text-center text-[10px] text-gray-400 font-mono">
                      {new Date(s.date).toLocaleDateString()} {new Date(s.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded text-[10px] uppercase font-mono font-extrabold">
                        ● Cleared
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
