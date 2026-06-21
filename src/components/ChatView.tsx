import { useState, useEffect, useRef } from "react";
import { User, DirectMessage } from "../types";
import { useSocket } from "./SocketProvider";
import { Send, Bot, Loader2, Hash, Plus, X, Users, MessageCircle, Search, Settings } from "lucide-react";

interface ChatViewProps {
  currentUser: User | null;
  activeCommunityId: string;
}

interface Channel {
  id: string;
  name: string;
  description: string;
  workspace_id: string;
  created_by: string;
}

interface OnlineUser {
  id: string;
  name: string;
  avatar: string;
  role: string;
}

const DEMO_MEMBERS: OnlineUser[] = [
  { id: "1", name: "Alex Rivera", avatar: "https://ui-avatars.com/api/?name=Alex+Rivera&background=6366f1&color=fff", role: "Creator" },
  { id: "2", name: "Sarah Chen", avatar: "https://ui-avatars.com/api/?name=Sarah+Chen&background=10b981&color=fff", role: "Admin" },
  { id: "3", name: "Marcus Johnson", avatar: "https://ui-avatars.com/api/?name=Marcus+Johnson&background=f59e0b&color=fff", role: "Member" },
  { id: "4", name: "Emily Park", avatar: "https://ui-avatars.com/api/?name=Emily+Park&background=ec4899&color=fff", role: "Member" },
  { id: "5", name: "David Kim", avatar: "https://ui-avatars.com/api/?name=David+Kim&background=8b5cf6&color=fff", role: "Moderator" },
];

export default function ChatView({ currentUser, activeCommunityId }: ChatViewProps) {
  const { socket, isConnected } = useSocket();
  const [channels, setChannels] = useState<Channel[]>([]);
  const [activeChannelId, setActiveChannelId] = useState<string>("");
  const [messages, setMessages] = useState<DirectMessage[]>([]);
  const [inputText, setInputText] = useState("");
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [isAiResponding, setIsAiResponding] = useState(false);
  const [onlineCount, setOnlineCount] = useState(0);
  const [typingUsers, setTypingUsers] = useState<Map<string, string>>(new Map());
  const [showCreateChannel, setShowCreateChannel] = useState(false);
  const [newChannelName, setNewChannelName] = useState("");
  const [newChannelDesc, setNewChannelDesc] = useState("");
  const [showMemberList, setShowMemberList] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const prevChannelRef = useRef<string>("");

  const AI_CHANNEL = "channel-ai";

  // Load channels from API
  useEffect(() => {
    if (!activeCommunityId) return;
    async function loadChannels() {
      try {
        const res = await fetch(`/api/channels?workspaceId=${activeCommunityId}`);
        const data = await res.json();
        if (data.channels) {
          setChannels(data.channels);
          if (data.channels.length > 0 && !activeChannelId) {
            setActiveChannelId(data.channels[0].id);
          }
        }
      } catch (err) {
        console.error("Failed to load channels:", err);
      }
    }
    loadChannels();
  }, [activeCommunityId]);

  // Socket: join/leave channels
  useEffect(() => {
    if (!socket || !activeChannelId) return;

    if (prevChannelRef.current && prevChannelRef.current !== activeChannelId) {
      socket.emit("leave_channel", prevChannelRef.current);
    }

    socket.emit("join_channel", activeChannelId);
    prevChannelRef.current = activeChannelId;

    return () => {
      socket.emit("leave_channel", activeChannelId);
    };
  }, [socket, activeChannelId]);

  // Socket: listen for new messages
  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (msg: DirectMessage) => {
      setMessages((prev) => {
        if (prev.some((m) => m.id === msg.id)) return prev;
        return [...prev, msg];
      });
    };

    const handleOnlineCount = (count: number) => setOnlineCount(count);

    const handleUserTyping = ({ userId, userName }: { userId: string; userName: string }) => {
      setTypingUsers((prev) => {
        const next = new Map(prev);
        next.set(userId, userName);
        return next;
      });
    };

    const handleUserStopTyping = ({ userId }: { userId: string }) => {
      setTypingUsers((prev) => {
        const next = new Map(prev);
        next.delete(userId);
        return next;
      });
    };

    socket.on("new_message", handleNewMessage);
    socket.on("online_count", handleOnlineCount);
    socket.on("user_typing", handleUserTyping);
    socket.on("user_stop_typing", handleUserStopTyping);

    return () => {
      socket.off("new_message", handleNewMessage);
      socket.off("online_count", handleOnlineCount);
      socket.off("user_typing", handleUserTyping);
      socket.off("user_stop_typing", handleUserStopTyping);
    };
  }, [socket]);

  // Load messages when channel changes
  useEffect(() => {
    if (!activeChannelId || activeChannelId === AI_CHANNEL) {
      setMessages([]);
      return;
    }
    async function loadMessages() {
      setIsLoadingMessages(true);
      try {
        const res = await fetch(`/api/channels/${activeChannelId}/messages`);
        const data = await res.json();
        setMessages(data.messages || []);
      } catch (err) {
        console.error("Failed to load messages:", err);
      } finally {
        setIsLoadingMessages(false);
      }
    }
    loadMessages();
  }, [activeChannelId]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isAiResponding]);

  const handleTyping = () => {
    if (!socket || activeChannelId === AI_CHANNEL) return;
    socket.emit("typing", { channelId: activeChannelId });

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit("stop_typing", { channelId: activeChannelId });
    }, 2000);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    const text = inputText.trim();
    if (!text) return;

    if (activeChannelId === AI_CHANNEL) {
      // AI Copilot
      setIsAiResponding(true);
      const userMsg: DirectMessage = {
        id: `dm-${Date.now()}`,
        channelId: AI_CHANNEL,
        senderId: currentUser?.id || "guest",
        senderName: currentUser?.fullName || "Guest",
        senderAvatar: currentUser?.avatarUrl || "",
        content: text,
        createdAt: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, userMsg]);
      setInputText("");

      try {
        const res = await fetch("/api/ai/assistant", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: text, context: "chat-copilot" }),
        });
        const data = await res.json();
        const botMsg: DirectMessage = {
          id: `dm-bot-${Date.now()}`,
          channelId: AI_CHANNEL,
          senderId: "bot-gemini",
          senderName: "Gemini Copilot",
          senderAvatar: "",
          content: data.response || "I couldn't generate a response right now.",
          createdAt: new Date().toISOString(),
        };
        setMessages((prev) => [...prev, botMsg]);
      } catch {
        setMessages((prev) => [
          ...prev,
          {
            id: `dm-bot-err-${Date.now()}`,
            channelId: AI_CHANNEL,
            senderId: "bot-gemini",
            senderName: "Gemini Copilot",
            senderAvatar: "",
            content: "Sorry, I'm having trouble connecting. Please try again.",
            createdAt: new Date().toISOString(),
          },
        ]);
      } finally {
        setIsAiResponding(false);
      }
    } else {
      // Regular channel message
      if (socket) {
        socket.emit("send_message", {
          channelId: activeChannelId,
          content: text,
          senderId: currentUser?.id,
          senderName: currentUser?.fullName,
          senderAvatar: currentUser?.avatarUrl,
        });
      }
      setInputText("");
    }
  };

  const handleCreateChannel = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChannelName.trim()) return;

    try {
      const res = await fetch("/api/channels", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newChannelName.replace(/^#\s*/, ""),
          description: newChannelDesc,
          workspaceId: activeCommunityId,
          createdBy: currentUser?.id,
        }),
      });
      const data = await res.json();
      if (data.channel) {
        setChannels([...channels, data.channel]);
        setActiveChannelId(data.channel.id);
      }
    } catch (err) {
      console.error("Failed to create channel:", err);
    }

    setShowCreateChannel(false);
    setNewChannelName("");
    setNewChannelDesc("");
  };

  const activeChannel = channels.find((c) => c.id === activeChannelId) || (activeChannelId === AI_CHANNEL ? { id: AI_CHANNEL, name: "Gemini Copilot", description: "AI assistant for curriculum design" } : null);
  const typingList = Array.from(typingUsers.values());

  return (
    <div className="h-full flex bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-sm m-2 sm:m-4 lg:m-6">
      {/* Channel sidebar */}
      <div className="w-56 border-r border-slate-200/80 bg-slate-50/50 flex flex-col shrink-0">
        <div className="px-6 py-4 border-b border-slate-200/80 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-slate-900">Channels</h3>
            <div className="flex items-center gap-1.5 mt-1">
              <span className={`w-2 h-2 rounded-full ${isConnected ? "bg-emerald-500" : "bg-slate-300"}`} />
              <span className="text-[10px] text-slate-400">{isConnected ? "Connected" : "Offline"}</span>
            </div>
          </div>
          {(() => { const chatWsRole = currentUser?.workspaceRoles?.[activeCommunityId]; return chatWsRole && ["owner", "admin", "moderator"].includes(chatWsRole); })() && (
            <button
              onClick={() => setShowCreateChannel(true)}
              className="w-7 h-7 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:text-indigo-600 hover:border-indigo-200 transition cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="flex-1 p-2 space-y-0.5 overflow-y-auto">
          {channels.map((chan) => {
            const isSelected = chan.id === activeChannelId;
            return (
              <button
                key={chan.id}
                onClick={() => setActiveChannelId(chan.id)}
                className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-left transition cursor-pointer ${
                  isSelected ? "bg-indigo-50 text-indigo-900 border border-indigo-100" : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                <Hash className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span className="truncate">{chan.name.replace(/^#\s*/, "")}</span>
              </button>
            );
          })}

          {/* AI channel */}
          <div className="pt-2 mt-2 border-t border-slate-200/80">
            <button
              onClick={() => setActiveChannelId(AI_CHANNEL)}
              className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-left transition cursor-pointer ${
                activeChannelId === AI_CHANNEL ? "bg-indigo-50 text-indigo-900 border border-indigo-100" : "text-indigo-600 hover:bg-indigo-50/50"
              }`}
            >
              <Bot className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
              <span>AI Copilot</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main chat area */}
      <div className="flex-1 flex flex-col bg-white min-w-0">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200/80 bg-white flex justify-between items-center shrink-0">
          <div>
            <h4 className="text-sm font-semibold text-slate-900">{activeChannel?.name || "Select a channel"}</h4>
            <p className="text-xs text-slate-400 mt-0.5 truncate">{activeChannel?.description}</p>
          </div>
          <div className="flex items-center gap-2">
            {activeChannelId !== AI_CHANNEL && (
              <div className="flex items-center gap-1.5 text-xs text-slate-400">
                <Users className="w-3.5 h-3.5" />
                <span>{onlineCount}</span>
              </div>
            )}
            <button
              onClick={() => setShowMemberList(!showMemberList)}
              className={`p-2 rounded-lg transition cursor-pointer ${showMemberList ? "bg-slate-100 text-slate-700" : "text-slate-400 hover:bg-slate-50"}`}
            >
              <Users className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 p-4 overflow-y-auto space-y-4">
          {isLoadingMessages ? (
            <div className="flex items-center justify-center p-12 text-slate-400 text-sm">
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
              Loading messages...
            </div>
          ) : messages.length === 0 ? (
            <div className="p-12 text-center">
              <MessageCircle className="w-10 h-10 text-slate-200 mx-auto mb-3" />
              <p className="text-sm text-slate-400">No messages yet. Start the conversation!</p>
            </div>
          ) : (
            messages.map((m) => {
              const isMe = m.senderId === currentUser?.id;
              const isBot = m.senderId === "bot-gemini";
              return (
                <div key={m.id} className={`flex items-start gap-3 ${isMe ? "justify-end" : ""}`}>
                  {!isMe && (
                    <img
                      src={m.senderAvatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(m.senderName)}&background=6366f1&color=fff`}
                      alt="avatar"
                      referrerPolicy="no-referrer"
                      className="w-8 h-8 rounded-full border object-cover shrink-0 mt-0.5"
                    />
                  )}
                  <div className={`flex flex-col max-w-[70%] ${isMe ? "items-end" : ""}`}>
                    <div className="flex items-center gap-1.5 mb-1 text-[10px] text-slate-400">
                      <span className="font-medium text-slate-700">{m.senderName}</span>
                      <span className="text-slate-300">·</span>
                      <span>{new Date(m.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                    </div>
                    <div
                      className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
                        isMe
                          ? "bg-indigo-600 text-white rounded-tr-md"
                          : isBot
                          ? "bg-indigo-50 border border-indigo-100 text-slate-800 rounded-tl-md"
                          : "bg-slate-100 text-slate-800 rounded-tl-md"
                      }`}
                    >
                      {m.content}
                    </div>
                  </div>
                </div>
              );
            })
          )}

          {/* AI thinking */}
          {isAiResponding && (
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 shrink-0 mt-0.5 text-xs font-bold">
                AI
              </div>
              <div className="px-4 py-3 bg-indigo-50 border border-indigo-100 text-slate-600 rounded-2xl rounded-tl-md text-sm flex items-center gap-2">
                <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-600" />
                <span>Thinking...</span>
              </div>
            </div>
          )}

          {/* Typing indicator */}
          {typingList.length > 0 && activeChannelId !== AI_CHANNEL && (
            <div className="flex items-center gap-2 text-xs text-slate-400 px-1">
              <div className="flex gap-0.5">
                <span className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                <span className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                <span className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
              <span>{typingList.join(", ")} {typingList.length === 1 ? "is" : "are"} typing...</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <form onSubmit={handleSendMessage} className="p-4 border-t border-slate-200/80 bg-white flex gap-2 shrink-0">
          <input
            type="text"
            required
            value={inputText}
            onChange={(e) => {
              setInputText(e.target.value);
              handleTyping();
            }}
            placeholder={activeChannelId === AI_CHANNEL ? "Ask AI anything..." : `Message #${activeChannel?.name?.replace(/^#\s*/, "") || "channel"}...`}
            className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition"
          />
          <button
            type="submit"
            disabled={!inputText.trim() || isAiResponding}
            className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl text-sm font-medium flex items-center justify-center gap-1.5 cursor-pointer transition"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>

      {/* Member list sidebar */}
      {showMemberList && activeChannelId !== AI_CHANNEL && (
        <div className="w-56 border-l border-slate-200/80 bg-slate-50/50 flex flex-col shrink-0">
          <div className="p-4 border-b border-slate-200/80">
            <h3 className="text-sm font-semibold text-slate-900">Members</h3>
            <p className="text-xs text-slate-400 mt-0.5">{DEMO_MEMBERS.length} in this channel</p>
          </div>
          <div className="flex-1 p-3 space-y-1 overflow-y-auto">
            {DEMO_MEMBERS.map((member) => (
              <div key={member.id} className="flex items-center gap-2.5 px-2 py-2 rounded-lg hover:bg-slate-100 transition">
                <div className="relative">
                  <img src={member.avatar} alt={member.name} className="w-8 h-8 rounded-full object-cover" />
                  <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-medium text-slate-900 truncate">{member.name}</div>
                  <div className="text-[10px] text-slate-400">{member.role}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Create channel modal */}
      {showCreateChannel && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl w-full max-w-sm p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-semibold text-slate-900">Create Channel</h3>
              <button onClick={() => setShowCreateChannel(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreateChannel} className="space-y-3">
              <div>
                <label className="text-sm font-medium text-slate-700 block mb-1">Name</label>
                <input
                  type="text"
                  required
                  value={newChannelName}
                  onChange={(e) => setNewChannelName(e.target.value)}
                  placeholder="e.g. general"
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 block mb-1">Description</label>
                <input
                  type="text"
                  value={newChannelDesc}
                  onChange={(e) => setNewChannelDesc(e.target.value)}
                  placeholder="Optional description"
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition"
                />
              </div>
              <div className="flex gap-2 pt-2">
                <button type="button" onClick={() => setShowCreateChannel(false)} className="flex-1 px-4 py-2.5 bg-slate-100 text-slate-600 rounded-xl text-sm font-medium hover:bg-slate-200 transition cursor-pointer">
                  Cancel
                </button>
                <button type="submit" className="flex-1 px-4 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-medium hover:bg-indigo-700 transition cursor-pointer">
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
