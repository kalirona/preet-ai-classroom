import { useState, useEffect, useRef, useCallback } from "react";
import { User, DirectMessage } from "../types";
import { useSocket } from "./SocketProvider";
import { Send, MessageCircle, Bot, Loader2, Hash, Plus, X, Users } from "lucide-react";

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
        // Avoid duplicates
        if (prev.some((m) => m.id === msg.id)) return prev;
        return [...prev, msg];
      });
    };

    const handleOnlineCount = (count: number) => {
      setOnlineCount(count);
    };

    const handleUserTyping = (data: { userId: string; userName: string; channelId: string }) => {
      if (data.channelId === activeChannelId && data.userId !== currentUser?.id) {
        setTypingUsers((prev) => new Map(prev).set(data.userId, data.userName));
      }
    };

    const handleUserStopTyping = (data: { userId: string; channelId: string }) => {
      if (data.channelId === activeChannelId) {
        setTypingUsers((prev) => {
          const next = new Map(prev);
          next.delete(data.userId);
          return next;
        });
      }
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
  }, [socket, activeChannelId, currentUser?.id]);

  // Load message history when channel changes
  useEffect(() => {
    if (!activeChannelId) return;

    if (activeChannelId === AI_CHANNEL) {
      setMessages([
        {
          id: "msg-ai-welcome",
          senderId: "bot-gemini",
          senderName: "Gemini Copilot",
          senderAvatar: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=100",
          recipientId: AI_CHANNEL,
          content: "Welcome! Ask me about structuring drip content, pricing tiers, badges, or SMTP templates.",
          createdAt: new Date().toISOString(),
        },
      ]);
      return;
    }

    async function loadHistory() {
      setIsLoadingMessages(true);
      try {
        const res = await fetch(`/api/chat?recipientId=${activeChannelId}`);
        const data = await res.json();
        if (data.messages) setMessages(data.messages);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoadingMessages(false);
      }
    }
    loadHistory();
    setTypingUsers(new Map());
  }, [activeChannelId]);

  // Auto scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isAiResponding]);

  // Typing indicator emit
  const handleTyping = useCallback(() => {
    if (!socket || !activeChannelId || !currentUser) return;
    socket.emit("typing", { channelId: activeChannelId, userName: currentUser.fullName });

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit("stop_typing", { channelId: activeChannelId });
    }, 2000);
  }, [socket, activeChannelId, currentUser]);

  // Send message
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !currentUser) return;

    const myInput = inputText;
    setInputText("");

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    if (socket && activeChannelId !== AI_CHANNEL) {
      socket.emit("stop_typing", { channelId: activeChannelId });
    }

    if (activeChannelId === AI_CHANNEL) {
      const tempMsg: DirectMessage = {
        id: `m-temp-${Date.now()}`,
        senderId: currentUser.id,
        senderName: currentUser.fullName,
        senderAvatar: currentUser.avatarUrl,
        recipientId: AI_CHANNEL,
        content: myInput,
        createdAt: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, tempMsg]);

      setIsAiResponding(true);
      try {
        const res = await fetch("/api/ai/assistant", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ prompt: myInput }),
        });
        const data = await res.json();
        if (data.response) {
          setMessages((prev) => [
            ...prev.filter((m) => m.id !== tempMsg.id),
            tempMsg,
            {
              id: `msg-ai-resp-${Date.now()}`,
              senderId: "bot-gemini",
              senderName: "Gemini Copilot",
              senderAvatar: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=100",
              recipientId: AI_CHANNEL,
              content: data.response,
              createdAt: new Date().toISOString(),
            },
          ]);
        }
      } catch (ex) {
        console.error(ex);
      } finally {
        setIsAiResponding(false);
      }
    } else if (socket) {
      socket.emit("send_message", {
        channelId: activeChannelId,
        content: myInput,
        senderName: currentUser.fullName,
        senderAvatar: currentUser.avatarUrl,
      });
    }
  };

  // Create channel
  const handleCreateChannel = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChannelName.trim()) return;
    try {
      const res = await fetch("/api/channels", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          workspaceId: activeCommunityId,
          name: newChannelName,
          description: newChannelDesc,
        }),
      });
      const data = await res.json();
      if (data.success && data.channel) {
        setChannels((prev) => [...prev, data.channel]);
        setActiveChannelId(data.channel.id);
        setShowCreateChannel(false);
        setNewChannelName("");
        setNewChannelDesc("");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const activeChannel = channels.find((c) => c.id === activeChannelId) || (activeChannelId === AI_CHANNEL ? { id: AI_CHANNEL, name: "Gemini Copilot", description: "AI assistant for curriculum design" } : null);
  const typingList = Array.from(typingUsers.values());

  return (
    <div className="h-full flex bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-sm m-4 lg:m-6">
      {/* Channel sidebar */}
      <div className="w-60 lg:w-64 border-r border-slate-200/80 bg-slate-50/50 flex flex-col shrink-0">
        <div className="p-4 border-b border-slate-200/80 flex items-center justify-between">
          <div>
            <h3 className="text-[10px] font-bold tracking-widest text-slate-400 uppercase font-mono">Channels</h3>
            <div className="flex items-center gap-1.5 mt-1">
              <span className={`w-2 h-2 rounded-full ${isConnected ? "bg-emerald-500" : "bg-slate-300"}`} />
              <span className="text-[10px] text-slate-400 font-mono">{isConnected ? "Connected" : "Offline"}</span>
            </div>
          </div>
          {currentUser && ["owner", "admin", "moderator"].includes(currentUser.role) && (
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
                className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold text-left transition cursor-pointer ${
                  isSelected ? "bg-indigo-50 text-indigo-900 border border-indigo-100" : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                <Hash className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span className="truncate">{chan.name.replace(/^#\s*/, "")}</span>
              </button>
            );
          })}

          {/* AI channel always at bottom */}
          <div className="pt-2 mt-2 border-t border-slate-200/80">
            <button
              onClick={() => setActiveChannelId(AI_CHANNEL)}
              className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold text-left transition cursor-pointer ${
                activeChannelId === AI_CHANNEL ? "bg-indigo-50 text-indigo-900 border border-indigo-100" : "text-indigo-600 hover:bg-indigo-50/50"
              }`}
            >
              <Bot className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
              <span>Gemini Copilot</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main chat area */}
      <div className="flex-1 flex flex-col bg-white min-w-0">
        {/* Header */}
        <div className="p-4 border-b border-slate-200/80 bg-white flex justify-between items-center shrink-0">
          <div>
            <h4 className="text-xs font-bold text-slate-900">{activeChannel?.name || "Select channel"}</h4>
            <p className="text-[10px] text-slate-400 mt-0.5 truncate">{activeChannel?.description}</p>
          </div>
          <div className="flex items-center gap-3">
            {activeChannelId !== AI_CHANNEL && (
              <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-mono">
                <Users className="w-3 h-3" />
                <span>{onlineCount} online</span>
              </div>
            )}
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 p-4 overflow-y-auto space-y-4">
          {isLoadingMessages ? (
            <div className="flex items-center justify-center p-12 text-slate-400 text-xs">
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
              Loading messages...
            </div>
          ) : messages.length === 0 ? (
            <div className="p-12 text-center text-xs text-slate-300">
              No messages yet. Start the conversation!
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
                      <span className="font-bold text-slate-700">{m.senderName}</span>
                      <span className="text-slate-300">·</span>
                      <span className="font-mono">{new Date(m.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                    </div>
                    <div
                      className={`p-3 rounded-2xl text-xs leading-relaxed whitespace-pre-wrap ${
                        isMe
                          ? "bg-indigo-600 text-white shadow-sm rounded-tr-none"
                          : isBot
                          ? "bg-indigo-50 border border-indigo-100 text-slate-800 rounded-tl-none"
                          : "bg-slate-100 text-slate-800 rounded-tl-none"
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
              <div className="w-8 h-8 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shrink-0 mt-0.5 text-xs font-bold font-mono">
                AI
              </div>
              <div className="flex flex-col space-y-1">
                <span className="text-[10px] text-slate-400 font-bold font-mono uppercase tracking-wider">Thinking...</span>
                <div className="p-3 bg-indigo-50 border border-indigo-100 text-slate-500 rounded-xl rounded-tl-none text-xs flex items-center gap-2">
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-600" />
                  <span>Generating response...</span>
                </div>
              </div>
            </div>
          )}

          {/* Typing indicator */}
          {typingList.length > 0 && activeChannelId !== AI_CHANNEL && (
            <div className="flex items-center gap-2 text-[10px] text-slate-400 font-mono px-1">
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
            placeholder={activeChannelId === AI_CHANNEL ? "Ask Gemini anything..." : `Message #${activeChannel?.name?.replace(/^#\s*/, "") || "channel"}...`}
            className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition"
          />
          <button
            type="submit"
            disabled={!inputText.trim() || isAiResponding}
            className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-sm transition"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>

      {/* Create channel modal */}
      {showCreateChannel && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl w-full max-w-sm p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900">Create Channel</h3>
              <button onClick={() => setShowCreateChannel(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleCreateChannel} className="space-y-3">
              <div>
                <label className="text-[10px] font-mono uppercase font-bold text-slate-500 block mb-1">Name</label>
                <input
                  type="text"
                  required
                  value={newChannelName}
                  onChange={(e) => setNewChannelName(e.target.value)}
                  placeholder="e.g. general"
                  className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition"
                />
              </div>
              <div>
                <label className="text-[10px] font-mono uppercase font-bold text-slate-500 block mb-1">Description</label>
                <input
                  type="text"
                  value={newChannelDesc}
                  onChange={(e) => setNewChannelDesc(e.target.value)}
                  placeholder="Optional description"
                  className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition"
                />
              </div>
              <div className="flex gap-2 pt-2">
                <button type="button" onClick={() => setShowCreateChannel(false)} className="flex-1 px-3 py-2 bg-slate-100 text-slate-600 rounded-lg text-xs font-semibold hover:bg-slate-200 transition cursor-pointer">
                  Cancel
                </button>
                <button type="submit" className="flex-1 px-3 py-2 bg-indigo-600 text-white rounded-lg text-xs font-semibold hover:bg-indigo-700 transition cursor-pointer shadow-sm">
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
