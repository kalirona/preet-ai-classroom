import { Notification } from "../types";
import { Bell, Check } from "lucide-react";

interface NotificationsViewProps {
  notifications: Notification[];
  onMarkAllRead: () => void;
}

export default function NotificationsView({ notifications, onMarkAllRead }: NotificationsViewProps) {
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <div className="h-full bg-[#F8F9FB] overflow-y-auto">
      <div className="max-w-3xl mx-auto p-4 sm:p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-sm">
              <Bell className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-900 font-display">Notifications</h1>
              <p className="text-xs text-slate-400">
                {unreadCount > 0 ? `${unreadCount} unread` : "All caught up"}
              </p>
            </div>
          </div>
          {unreadCount > 0 && (
            <button
              onClick={onMarkAllRead}
              className="px-4 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 text-xs font-bold rounded-xl transition cursor-pointer flex items-center gap-1.5"
            >
              <Check className="w-3.5 h-3.5" />
              Mark All Read
            </button>
          )}
        </div>

        {/* Notification list */}
        {notifications.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center shadow-sm">
            <Bell className="w-8 h-8 text-slate-200 mx-auto mb-3" />
            <p className="text-xs text-slate-400">No notifications yet.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {notifications.map((n) => (
              <div
                key={n.id}
                className={`bg-white rounded-xl border p-4 flex gap-3 items-start shadow-sm transition hover:border-slate-300 ${
                  n.isRead ? "border-slate-200/80" : "border-indigo-200/80 bg-indigo-50/20"
                }`}
              >
                <span className="text-lg mt-0.5 shrink-0">
                  {n.type === "level_up" ? "🎉" : n.type === "like" ? "👍" : n.type === "comment" ? "💬" : "💳"}
                </span>
                <div className="flex-1 min-w-0">
                  <span className="font-bold text-slate-900 text-xs block">{n.title}</span>
                  <p className="text-xs text-slate-500 mt-0.5">{n.message}</p>
                  <span className="text-[10px] text-slate-400 font-mono mt-1.5 block">
                    {new Date(n.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>
                {!n.isRead && <span className="w-2 h-2 bg-indigo-500 rounded-full mt-1.5 shrink-0" />}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
