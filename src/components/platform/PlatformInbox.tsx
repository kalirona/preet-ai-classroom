import { useState, useEffect } from "react";
import { MessageSquare, Mail, Send, CheckCircle, AlertTriangle, User, Search, X } from "lucide-react";

const STORAGE_KEY = "platform_inbox_tickets";

interface Ticket {
  id: string;
  from: string;
  email: string;
  subject: string;
  message: string;
  status: "open" | "replied" | "closed";
  date: string;
  replies: { from: string; body: string; date: string }[];
}

const defaultTickets: Ticket[] = [
  { id: "t1", from: "Sarah Johnson", email: "sarah@example.com", subject: "Cannot access my course", message: "I purchased the React Masterclass but it's not showing up in my dashboard.", status: "open", date: "2026-06-21 14:32", replies: [] },
  { id: "t2", from: "Mike Chen", email: "mike@example.com", subject: "Payment issue", message: "I was charged twice for my subscription. Please refund the duplicate.", status: "open", date: "2026-06-21 10:15", replies: [{ from: "Support", body: "We're looking into this. Can you provide the transaction IDs?", date: "2026-06-21 11:00" }] },
  { id: "t3", from: "Emily Davis", email: "emily@example.com", subject: "Account suspended", message: "My account was suspended but I haven't violated any rules.", status: "replied", date: "2026-06-20 09:45", replies: [{ from: "Support", body: "We've reviewed your account and reinstated it. Apologies for the inconvenience.", date: "2026-06-20 15:30" }] },
  { id: "t4", from: "Alex Rivera", email: "alex@example.com", subject: "Feature request: dark mode", message: "Would love to see a dark mode option for the platform.", status: "closed", date: "2026-06-18 16:20", replies: [{ from: "Support", body: "Thanks for the suggestion! We'll consider it for a future update.", date: "2026-06-19 10:00" }] },
];

function loadTickets(): Ticket[] {
  try { const s = localStorage.getItem(STORAGE_KEY); return s ? JSON.parse(s) : defaultTickets(); }
  catch { return defaultTickets(); }
}

function saveTickets(tickets: Ticket[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tickets));
}

export default function PlatformInbox() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [selected, setSelected] = useState<Ticket | null>(null);
  const [replyText, setReplyText] = useState("");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "open" | "replied" | "closed">("all");
  const [feedback, setFeedback] = useState<string | null>(null);

  useEffect(() => {
    setTickets(loadTickets());
  }, []);

  const filtered = tickets.filter((t) => {
    if (filter !== "all" && t.status !== filter) return false;
    if (search && !t.subject.toLowerCase().includes(search.toLowerCase()) && !t.from.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const stats = {
    total: tickets.length,
    open: tickets.filter((t) => t.status === "open").length,
    replied: tickets.filter((t) => t.status === "replied").length,
    closed: tickets.filter((t) => t.status === "closed").length,
  };

  const handleSendReply = () => {
    if (!selected || !replyText.trim()) return;
    const reply = { from: "Super Admin", body: replyText.trim(), date: new Date().toLocaleString() };
    const updated = tickets.map((t) =>
      t.id === selected.id
        ? { ...t, replies: [...t.replies, reply], status: "replied" as const }
        : t
    );
    setTickets(updated);
    saveTickets(updated);
    setSelected({ ...selected, replies: [...selected.replies, reply], status: "replied" });
    setReplyText("");
    setFeedback("Reply sent.");
    setTimeout(() => setFeedback(null), 2000);
  };

  const handleClose = (id: string) => {
    const updated = tickets.map((t) => t.id === id ? { ...t, status: "closed" as const } : t);
    setTickets(updated);
    saveTickets(updated);
    if (selected?.id === id) setSelected({ ...selected, status: "closed" });
    setFeedback("Ticket closed.");
    setTimeout(() => setFeedback(null), 2000);
  };

  const badge = (status: string) => {
    const styles: Record<string, string> = {
      open: "bg-amber-50 text-amber-600 border-amber-200",
      replied: "bg-blue-50 text-blue-600 border-blue-200",
      closed: "bg-slate-100 text-slate-500 border-slate-200",
    };
    return `text-[10px] font-bold px-2 py-0.5 rounded-full border ${styles[status] || styles.closed}`;
  };

  return (
    <div className="flex gap-6 h-[calc(100vh-12rem)] animate-in fade-in duration-150">
      {feedback && (
        <div className="fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-lg">
          <CheckCircle className="w-4 h-4" /> {feedback}
        </div>
      )}

      {/* Ticket List */}
      <div className="w-96 shrink-0 bg-white rounded-2xl border border-slate-200/80 shadow-sm flex flex-col overflow-hidden">
        <div className="p-4 border-b border-slate-100 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900">Support Inbox</h3>
            <span className="text-xs text-slate-400">{stats.open} open</span>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
            <input type="text" placeholder="Search tickets..." value={search} onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition" />
          </div>
          <div className="flex gap-1">
            {(["all", "open", "replied", "closed"] as const).map((f) => (
              <button key={f} onClick={() => setFilter(f)}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition cursor-pointer ${filter === f ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-500 hover:bg-slate-200"}`}>
                {f === "all" ? `All (${stats.total})` : `${f} (${stats[f as keyof typeof stats]})`}
              </button>
            ))}
          </div>
        </div>
        <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
          {filtered.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-xs font-mono">No tickets found.</div>
          ) : (
            filtered.map((t) => (
              <div key={t.id} onClick={() => setSelected(t)}
                className={`px-4 py-3 cursor-pointer transition hover:bg-slate-50 ${selected?.id === t.id ? "bg-indigo-50/50 border-l-2 border-indigo-500" : ""}`}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-slate-900">{t.from}</span>
                  <span className={badge(t.status)}>{t.status}</span>
                </div>
                <p className="text-xs font-semibold text-slate-700 truncate">{t.subject}</p>
                <p className="text-[10px] text-slate-400 mt-0.5">{t.date}</p>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Ticket Detail */}
      <div className="flex-1 bg-white rounded-2xl border border-slate-200/80 shadow-sm flex flex-col overflow-hidden">
        {!selected ? (
          <div className="flex-1 flex items-center justify-center text-slate-400 font-mono text-xs">
            <div className="text-center space-y-2">
              <MessageSquare className="w-8 h-8 mx-auto text-slate-300" />
              <p>Select a ticket to view</p>
            </div>
          </div>
        ) : (
          <>
            <div className="p-5 border-b border-slate-100 flex items-start justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-slate-900">{selected.subject}</h3>
                  <span className={badge(selected.status)}>{selected.status}</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <User className="w-3 h-3" /> {selected.from} &lt;{selected.email}&gt;
                  <span className="text-slate-300">·</span>
                  {selected.date}
                </div>
              </div>
              {selected.status !== "closed" && (
                <button onClick={() => handleClose(selected.id)}
                  className="px-3 py-1.5 text-xs font-bold text-slate-400 hover:text-rose-600 hover:bg-rose-50 border border-slate-200 rounded-lg transition cursor-pointer flex items-center gap-1">
                  <X className="w-3 h-3" /> Close
                </button>
              )}
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {/* Original message */}
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-200/80">
                <p className="text-xs text-slate-700 whitespace-pre-wrap">{selected.message}</p>
              </div>
              {/* Replies */}
              {selected.replies.map((r, i) => (
                <div key={i} className={`rounded-xl p-4 border ${r.from === "Super Admin" ? "bg-indigo-50 border-indigo-200 ml-8" : "bg-slate-50 border-slate-200/80 mr-8"}`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold text-slate-500">{r.from}</span>
                    <span className="text-[10px] text-slate-400">{r.date}</span>
                  </div>
                  <p className="text-xs text-slate-700">{r.body}</p>
                </div>
              ))}
            </div>

            {/* Reply Box */}
            {selected.status !== "closed" && (
              <div className="p-4 border-t border-slate-100">
                <div className="flex gap-2">
                  <textarea value={replyText} onChange={(e) => setReplyText(e.target.value)} rows={2}
                    placeholder="Type your reply..."
                    className="flex-1 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition resize-none" />
                  <button onClick={handleSendReply} disabled={!replyText.trim()}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 disabled:opacity-50 cursor-pointer self-end">
                    <Send className="w-3.5 h-3.5" /> Send
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
