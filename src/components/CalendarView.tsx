import React, { useState } from "react";
import { LiveEvent, UserRole } from "../types";
import { Calendar, Video, Clock, Check, Plus, Users, Globe, ExternalLink, X, MapPin, Sparkles } from "lucide-react";

interface CalendarViewProps {
  userRole: UserRole;
  activeCommunityId: string;
  events: LiveEvent[];
  onAddEvent: (event: LiveEvent) => void;
  onRsvpEvent: (id: string) => void;
}

export default function CalendarView({
  userRole,
  activeCommunityId,
  events,
  onAddEvent,
  onRsvpEvent
}: CalendarViewProps) {
  const [showEventCreatorModal, setShowEventCreatorModal] = useState(false);
  const [newEventTitle, setNewEventTitle] = useState("");
  const [newEventDesc, setNewEventDesc] = useState("");
  const [newEventStart, setNewEventStart] = useState("");
  const [newEventPlatform, setNewEventPlatform] = useState<"Zoom" | "Google Meet" | "YouTube Live" | "Vimeo">("Zoom");
  const [newEventUrl, setNewEventUrl] = useState("");
  const [newEventCategory, setNewEventCategory] = useState<"Class" | "Q&A" | "Mastermind" | "Coaching">("Class");

  const [rsvpFeedback, setRsvpFeedback] = useState<string | null>(null);

  const handleCreateEventSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEventTitle.trim() || !newEventStart.trim() || !newEventUrl.trim()) return;

    try {
      const res = await fetch("/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          communityId: activeCommunityId,
          title: newEventTitle,
          description: newEventDesc,
          startAt: new Date(newEventStart).toISOString(),
          platform: newEventPlatform,
          platformUrl: newEventUrl,
          category: newEventCategory
        })
      });
      const data = await res.json();
      if (data.success && data.event) {
        onAddEvent(data.event);
        // Reset states
        setNewEventTitle("");
        setNewEventDesc("");
        setNewEventStart("");
        setNewEventPlatform("Zoom");
        setNewEventUrl("");
        setNewEventCategory("Class");
        setShowEventCreatorModal(false);
      }
    } catch (er) {
      console.error("Event creation error: ", er);
    }
  };

  const handleRsvpWithXp = (id: string) => {
    onRsvpEvent(id);
    setRsvpFeedback("Confirmed RSVP! +20 XP awarded to your wallet.");
    setTimeout(() => setRsvpFeedback(null), 3500);
  };

  return (
    <div className="p-6 h-full overflow-y-auto" id="calendar-main-view">
      
      {/* Bento Grid layout header */}
      <div className="grid grid-cols-12 gap-6 mb-6">
        
        {/* Banner Card */}
        <div className="col-span-12 md:col-span-8 bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center">
            <Calendar className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-base font-bold text-gray-900 font-display">Live Events & Masterminds</h2>
            <p className="text-xs text-gray-400 mt-0.5">
              Sync upcoming masterclasses to your local stream, ask live questions, and network directly inside live feeds.
            </p>
          </div>
        </div>

        {/* Schedule Action Bento Widget for admins vs Student RSVP stats card */}
        {userRole === UserRole.ADMIN || userRole === UserRole.SUPER_ADMIN ? (
          <div className="col-span-12 md:col-span-4 bg-indigo-600 rounded-2xl p-6 text-white shadow-sm flex flex-col justify-between">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-widest text-indigo-100 font-mono">Creator Classrooms</h3>
              <p className="text-[11px] text-indigo-100 mt-1 leading-relaxed">
                Plan live sessions, timezones adjustments, and deliver custom replay recording workflows.
              </p>
            </div>
            <button
              onClick={() => setShowEventCreatorModal(true)}
              className="w-full py-2 bg-white text-indigo-700 hover:bg-indigo-50 font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition cursor-pointer mt-4"
              id="open-event-creator-modal-btn"
            >
              <Plus className="w-4 h-4" />
              Schedule Session
            </button>
          </div>
        ) : (
          <div className="col-span-12 md:col-span-4 bg-[#ECFDF5] border border-emerald-100 rounded-2xl p-6 text-emerald-950 shadow-sm flex flex-col justify-between">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-widest text-emerald-700 font-mono flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-emerald-600 fill-emerald-600 animate-pulse" />
                Active Attendance
              </h3>
              <p className="text-[11px] text-emerald-600 mt-1 leading-relaxed">
                Build daily learning streaks! Confirm RSVPs below to register class syncs and earn high-yield <strong className="text-emerald-800">+20 XP</strong> XP multipliers.
              </p>
            </div>
            <div className="w-full py-2 bg-emerald-600 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 mt-4 select-none">
              Learning Sync Activated
            </div>
          </div>
        )}

      </div>

      {rsvpFeedback && (
        <div className="bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl px-4 py-3 text-xs font-mono font-bold flex items-center gap-2 mb-4 animate-bounce">
          <Check className="w-4 h-4 text-emerald-600" />
          {rsvpFeedback}
        </div>
      )}

      {/* DETAILED WEBINAR TILES SCHEDULING ROWS */}
      <div className="space-y-4">
        <h3 className="text-xs font-bold text-gray-400 tracking-wider font-mono uppercase">Mastermind Timeline</h3>

        {events.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-200 py-16 text-center">
            <Calendar className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <h3 className="text-sm font-bold text-gray-700">No events scheduled</h3>
            <p className="text-xs text-gray-400 max-w-sm mx-auto mt-1">
              There are no webinars planned for this calendar window. Try hosting one now if you are an administrator!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {events.map((event) => {
              const startDateTime = new Date(event.startAt);
              const endDateTime = new Date(event.endAt);
              const rsvpCount = event.attendees?.length || 0;

              return (
                <div key={event.id} className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm flex flex-col justify-between hover:border-indigo-200 transition-all group" id={`event-card-ui-${event.id}`}>
                  
                  <div>
                    {/* Header: Event Category and platform badge */}
                    <div className="flex items-center justify-between mb-3 border-b border-gray-50 pb-3">
                      <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 text-[9px] font-mono font-bold rounded uppercase">
                        {event.category} Session
                      </span>
                      <span className="px-2 py-0.5 bg-gray-50 text-gray-500 text-[10px] rounded-md font-mono flex items-center gap-1">
                        <Video className="w-3.5 h-3.5 text-indigo-600" />
                        {event.platform}
                      </span>
                    </div>

                    <h4 className="text-xs font-bold text-gray-900 group-hover:text-indigo-600 transition truncate-2-lines">
                      {event.title}
                    </h4>
                    <p className="text-[11px] text-gray-500 mt-2 leading-relaxed">
                      {event.description}
                    </p>

                    {/* Time details */}
                    <div className="mt-4 space-y-1.5 p-3 bg-gray-50 rounded-xl border border-gray-100 text-[11px]">
                      <div className="flex items-center gap-2 text-gray-600 font-semibold font-mono">
                        <Clock className="w-3.5 h-3.5 text-gray-400" />
                        <span>{startDateTime.toLocaleDateString()} @ {startDateTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-400 font-mono">
                        <Globe className="w-3.5 h-3.5" />
                        <span>Custom Auto Timezone Selection ({event.timezone || "UTC"})</span>
                      </div>
                    </div>
                  </div>

                  {/* Attendance & RSVP action bar */}
                  <div className="mt-5 pt-4 border-t border-gray-50 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-1.5">
                      <Users className="w-4 h-4 text-indigo-600" />
                      <span className="text-[10px] font-bold text-gray-600">
                        {rsvpCount} RSVP'd students
                      </span>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => handleRsvpWithXp(event.id)}
                        className="px-3.5 py-1.5 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-semibold rounded-xl text-[10px] transition cursor-pointer"
                        id={`rsvp-btn-${event.id}`}
                      >
                        RSVP +20 XP
                      </button>
                      <a
                        href={event.platformUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-[10px] transition flex items-center gap-1"
                      >
                        Join Room
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>

                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* EVENT CREATION DIALOG OVERLAY */}
      {showEventCreatorModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl border border-gray-200 w-full max-w-lg shadow-xl overflow-hidden animate-in zoom-in-95 duration-100">
            
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-slate-50/50">
              <div>
                <h3 className="text-sm font-bold text-gray-900 font-display">Schedule Live Masterclass</h3>
                <p className="text-xs text-gray-400">Launch a private mastermind feed room with Zoom integration.</p>
              </div>
              <button
                onClick={() => setShowEventCreatorModal(false)}
                className="p-1 rounded-full hover:bg-gray-100 text-gray-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateEventSubmit}>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Session Title</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Prompt Architecture Roundtable"
                    value={newEventTitle}
                    onChange={(e) => setNewEventTitle(e.target.value)}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 font-sans"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Time & Date</label>
                  <input
                    type="datetime-local"
                    required
                    value={newEventStart}
                    onChange={(e) => setNewEventStart(e.target.value)}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-xs focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Platform</label>
                    <select
                      value={newEventPlatform}
                      onChange={(e) => setNewEventPlatform(e.target.value as any)}
                      className="w-full border border-gray-200 rounded-xl px-2 py-2 text-xs"
                    >
                      <option value="Zoom">Zoom</option>
                      <option value="Google Meet">Google Meet</option>
                      <option value="YouTube Live">YouTube Live</option>
                      <option value="Vimeo">Vimeo</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Type Categories</label>
                    <select
                      value={newEventCategory}
                      onChange={(e) => setNewEventCategory(e.target.value as any)}
                      className="w-full border border-gray-200 rounded-xl px-2 py-2 text-xs"
                    >
                      <option value="Class">Class Session</option>
                      <option value="Q&A">Live Q&A Desk</option>
                      <option value="Mastermind">Mastermind Circle</option>
                      <option value="Coaching">Private Coaching</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Streaming room link (URL)</label>
                  <input
                    type="url"
                    required
                    placeholder="e.g. https://zoom.us/abc-defg"
                    value={newEventUrl}
                    onChange={(e) => setNewEventUrl(e.target.value)}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Webinar Agenda Descriptions</label>
                  <textarea
                    rows={3}
                    placeholder="Provide specific notes regarding downloadables or worksheets needed..."
                    value={newEventDesc}
                    onChange={(e) => setNewEventDesc(e.target.value)}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-xs focus:outline-none"
                  />
                </div>
              </div>

              <div className="p-6 bg-slate-50/50 border-t border-gray-100 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowEventCreatorModal(false)}
                  className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-xs font-semibold text-gray-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-sm"
                >
                  Add to Calendar
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
}
