import { useState, useEffect } from "react";
import { User } from "../types";
import { HelpCircle, Send, CheckCircle, Clock, MessageCircle, AlertTriangle, ChevronDown, ChevronUp } from "lucide-react";

interface SupportViewProps {
  currentUser: User | null;
  activeCommunityId: string;
}

interface Ticket {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  subject: string;
  message: string;
  category: string;
  status: "open" | "in_progress" | "resolved";
  priority: "low" | "medium" | "high";
  createdAt: string;
  replies: TicketReply[];
}

interface TicketReply {
  id: string;
  userId: string;
  userName: string;
  message: string;
  createdAt: string;
}

const DEMO_TICKETS: Ticket[] = [
  {
    id: "t1",
    userId: "1",
    userName: "Marcus Johnson",
    userAvatar: "https://ui-avatars.com/api/?name=Marcus+Johnson&background=f59e0b&color=fff",
    subject: "Can't access my course after purchase",
    message: "I purchased the Advanced React course but when I try to access it from my classroom, it says I don't have permission. Can you help?",
    category: "billing",
    status: "open",
    priority: "high",
    createdAt: new Date(Date.now() - 3600000).toISOString(),
    replies: [],
  },
  {
    id: "t2",
    userId: "3",
    userName: "Emily Park",
    userAvatar: "https://ui-avatars.com/api/?name=Emily+Park&background=ec4899&color=fff",
    subject: "How to create a new course?",
    message: "I'm new to the platform and want to create my first course. What steps do I need to follow?",
    category: "general",
    status: "in_progress",
    priority: "medium",
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    replies: [
      {
        id: "r1",
        userId: "admin",
        userName: "Support Team",
        message: "Hi Emily! To create a course, go to Classroom > Course Builder. You can add modules, lessons, and quizzes there. Let us know if you need more help!",
        createdAt: new Date(Date.now() - 43200000).toISOString(),
      },
    ],
  },
  {
    id: "t3",
    userId: "4",
    userName: "David Kim",
    userAvatar: "https://ui-avatars.com/api/?name=David+Kim&background=8b5cf6&color=fff",
    subject: "Feature request: Dark mode",
    message: "Would love to see dark mode support for the platform. Any plans for that?",
    category: "feature_request",
    status: "resolved",
    priority: "low",
    createdAt: new Date(Date.now() - 172800000).toISOString(),
    replies: [],
  },
];

const CATEGORIES = [
  { value: "general", label: "General question" },
  { value: "billing", label: "Billing & payments" },
  { value: "technical", label: "Technical issue" },
  { value: "feature_request", label: "Feature request" },
  { value: "account", label: "Account access" },
];

const STATUS_STYLES: Record<string, string> = {
  open: "bg-amber-100 text-amber-700",
  in_progress: "bg-blue-100 text-blue-700",
  resolved: "bg-emerald-100 text-emerald-700",
};

const PRIORITY_STYLES: Record<string, string> = {
  low: "bg-slate-100 text-slate-600",
  medium: "bg-amber-100 text-amber-700",
  high: "bg-red-100 text-red-700",
};

export default function SupportView({ currentUser, activeCommunityId }: SupportViewProps) {
  const [tickets, setTickets] = useState<Ticket[]>(DEMO_TICKETS);
  const [showForm, setShowForm] = useState(false);
  const [expandedTicket, setExpandedTicket] = useState<string | null>(null);
  const [formData, setFormData] = useState({ subject: "", message: "", category: "general" });
  const [replyText, setReplyText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isAdmin = currentUser?.role === "owner" || currentUser?.role === "admin" || currentUser?.platformRole === "super_admin";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.subject.trim() || !formData.message.trim()) return;

    setIsSubmitting(true);

    const newTicket: Ticket = {
      id: `t${Date.now()}`,
      userId: currentUser?.id || "guest",
      userName: currentUser?.fullName || "Guest",
      userAvatar: currentUser?.avatarUrl || "",
      subject: formData.subject,
      message: formData.message,
      category: formData.category,
      status: "open",
      priority: "medium",
      createdAt: new Date().toISOString(),
      replies: [],
    };

    setTickets([newTicket, ...tickets]);
    setFormData({ subject: "", message: "", category: "general" });
    setShowForm(false);
    setIsSubmitting(false);
  };

  const handleReply = (ticketId: string) => {
    if (!replyText.trim()) return;

    setTickets((prev) =>
      prev.map((t) =>
        t.id === ticketId
          ? {
              ...t,
              status: "in_progress",
              replies: [
                ...t.replies,
                {
                  id: `r${Date.now()}`,
                  userId: currentUser?.id || "admin",
                  userName: currentUser?.fullName || "Support Team",
                  message: replyText,
                  createdAt: new Date().toISOString(),
                },
              ],
            }
          : t
      )
    );
    setReplyText("");
  };

  const handleResolve = (ticketId: string) => {
    setTickets((prev) => prev.map((t) => (t.id === ticketId ? { ...t, status: "resolved" } : t)));
  };

  const formatTime = (iso: string) => {
    const d = new Date(iso);
    const diff = Date.now() - d.getTime();
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return `${Math.floor(diff / 86400000)}d ago`;
  };

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-4xl mx-auto p-6 lg:p-8 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-slate-900">Help & Support</h1>
            <p className="text-sm text-slate-500 mt-1">
              {isAdmin ? "Manage support tickets from members" : "Get help or submit a request"}
            </p>
          </div>
          {!isAdmin && (
            <button
              onClick={() => setShowForm(true)}
              className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-medium flex items-center gap-1.5 cursor-pointer transition"
            >
              <Send className="w-4 h-4" />
              New Ticket
            </button>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-4 h-4 text-amber-500" />
              <span className="text-xs font-medium text-slate-500">Open</span>
            </div>
            <div className="text-2xl font-bold text-slate-900">{tickets.filter((t) => t.status === "open").length}</div>
          </div>
          <div className="bg-white border border-slate-200 rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-2">
              <MessageCircle className="w-4 h-4 text-blue-500" />
              <span className="text-xs font-medium text-slate-500">In Progress</span>
            </div>
            <div className="text-2xl font-bold text-slate-900">{tickets.filter((t) => t.status === "in_progress").length}</div>
          </div>
          <div className="bg-white border border-slate-200 rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="w-4 h-4 text-emerald-500" />
              <span className="text-xs font-medium text-slate-500">Resolved</span>
            </div>
            <div className="text-2xl font-bold text-slate-900">{tickets.filter((t) => t.status === "resolved").length}</div>
          </div>
        </div>

        {/* New ticket form */}
        {showForm && (
          <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4">
            <h3 className="text-base font-semibold text-slate-900">Submit a Request</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-sm font-medium text-slate-700 block mb-1">Category</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c.value} value={c.value}>{c.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 block mb-1">Subject</label>
                <input
                  type="text"
                  required
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  placeholder="Brief description of your issue"
                  className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 block mb-1">Message</label>
                <textarea
                  required
                  rows={4}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="Describe your issue in detail..."
                  className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 resize-none"
                />
              </div>
              <div className="flex gap-3">
                <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2.5 bg-slate-100 text-slate-600 rounded-xl text-sm font-medium hover:bg-slate-200 transition cursor-pointer">
                  Cancel
                </button>
                <button type="submit" disabled={isSubmitting} className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-medium flex items-center gap-1.5 cursor-pointer transition disabled:opacity-50">
                  <Send className="w-4 h-4" />
                  {isSubmitting ? "Submitting..." : "Submit Ticket"}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Ticket list */}
        <div className="space-y-3">
          {tickets.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center">
              <HelpCircle className="w-10 h-10 text-slate-200 mx-auto mb-3" />
              <p className="text-sm text-slate-400">No tickets yet. Submit a request if you need help.</p>
            </div>
          ) : (
            tickets.map((ticket) => {
              const isExpanded = expandedTicket === ticket.id;
              return (
                <div key={ticket.id} className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
                  <button
                    onClick={() => setExpandedTicket(isExpanded ? null : ticket.id)}
                    className="w-full p-5 flex items-center gap-4 text-left hover:bg-slate-50/50 transition cursor-pointer"
                  >
                    <img src={ticket.userAvatar} alt="" className="w-9 h-9 rounded-full object-cover shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-semibold text-slate-900 truncate">{ticket.subject}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-slate-400">
                        <span>{ticket.userName}</span>
                        <span className="text-slate-200">|</span>
                        <span>{formatTime(ticket.createdAt)}</span>
                        {ticket.replies.length > 0 && (
                          <>
                            <span className="text-slate-200">|</span>
                            <span>{ticket.replies.length} {ticket.replies.length === 1 ? "reply" : "replies"}</span>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-medium ${STATUS_STYLES[ticket.status]}`}>
                        {ticket.status.replace("_", " ")}
                      </span>
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-medium ${PRIORITY_STYLES[ticket.priority]}`}>
                        {ticket.priority}
                      </span>
                      {isExpanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                    </div>
                  </button>

                  {isExpanded && (
                    <div className="border-t border-slate-100 p-5 space-y-4">
                      <div className="bg-slate-50 rounded-xl p-4">
                        <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">{ticket.message}</p>
                      </div>

                      {/* Replies */}
                      {ticket.replies.length > 0 && (
                        <div className="space-y-3">
                          {ticket.replies.map((reply) => (
                            <div key={reply.id} className="flex gap-3">
                              <div className="w-7 h-7 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 shrink-0 text-xs font-bold">
                                {reply.userName.charAt(0)}
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="text-xs font-semibold text-slate-900">{reply.userName}</span>
                                  <span className="text-[10px] text-slate-400">{formatTime(reply.createdAt)}</span>
                                </div>
                                <p className="text-sm text-slate-600 leading-relaxed">{reply.message}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Reply input */}
                      {ticket.status !== "resolved" && (
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={replyText}
                            onChange={(e) => setReplyText(e.target.value)}
                            placeholder="Type a reply..."
                            className="flex-1 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                            onKeyDown={(e) => {
                              if (e.key === "Enter" && !e.shiftKey) {
                                e.preventDefault();
                                handleReply(ticket.id);
                              }
                            }}
                          />
                          <button
                            onClick={() => handleReply(ticket.id)}
                            disabled={!replyText.trim()}
                            className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl text-sm font-medium cursor-pointer transition"
                          >
                            <Send className="w-4 h-4" />
                          </button>
                          {isAdmin && (
                            <button
                              onClick={() => handleResolve(ticket.id)}
                              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-medium cursor-pointer transition"
                            >
                              <CheckCircle className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
