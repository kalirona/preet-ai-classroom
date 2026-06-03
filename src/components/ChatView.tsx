import React, { useState, useEffect, useRef } from "react";
import { User, DirectMessage, UserRole } from "../types";
import { Send, Sparkles, MessageCircle, ArrowRight, UserCheck, ShieldAlert, Laptop, Bot, SendHorizonal, Loader2 } from "lucide-react";

interface ChatViewProps {
  currentUser: User | null;
}

export default function ChatView({ currentUser }: ChatViewProps) {
  // Chat context channels
  const channels = [
    { id: "comm-ai", name: "# general-discussions", desc: "Main public announcement and social chatter room." },
    { id: "channel-devs", name: "# code-review-webhooks", desc: "Inspect live repository configurations and system logs." },
    { id: "channel-mrr", name: "# scale-and-growth", desc: "MRR strategies, landing grid audits, and subscription hacks." },
    { id: "channel-ai", name: "✨ gemini-copilot-bot", desc: "Ask our expert AI curriculum designer regarding your SaaS scaling ideas." }
  ];

  const [activeChannelId, setActiveChannelId] = useState("comm-ai");
  const [messages, setMessages] = useState<DirectMessage[]>([]);
  const [inputText, setInputText] = useState("");
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [isAiResponding, setIsAiResponding] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Sync messages on activeChannelId shift
  useEffect(() => {
    if (activeChannelId === "channel-ai") {
      setMessages([
        {
          id: "msg-ai-welcome",
          senderId: "bot-gemini",
          senderName: "Gemini Copilot Bot",
          senderAvatar: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=100",
          recipientId: "channel-ai",
          content: "Welcome to the Gemini Copilot workspace! Ask me any questions on structuring drip content, pricing tiers, badges, or Resend SMTP template setups.",
          createdAt: new Date().toISOString()
        }
      ]);
      return;
    }

    async function loadChatHistory() {
      setIsLoadingMessages(true);
      try {
        const res = await fetch(`/api/chat?recipientId=${activeChannelId}`);
        const data = await res.json();
        if (data.messages) {
          setMessages(data.messages);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoadingMessages(false);
      }
    }
    loadChatHistory();
  }, [activeChannelId]);

  // Handle message dispatch
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const myInput = inputText;
    setInputText("");

    // Setup temporary self message
    const tempMsg: DirectMessage = {
      id: `m-temp-${Date.now()}`,
      senderId: currentUser?.id || "user-student",
      senderName: currentUser?.fullName || "Lincoln Flores",
      senderAvatar: currentUser?.avatarUrl || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150",
      recipientId: activeChannelId,
      content: myInput,
      createdAt: new Date().toISOString()
    };

    setMessages((prev) => [...prev, tempMsg]);

    if (activeChannelId === "channel-ai") {
      setIsAiResponding(true);
      try {
        const res = await fetch("/api/ai/assistant", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ prompt: myInput })
        });
        const data = await res.json();
        if (data.response) {
          const aiMsg: DirectMessage = {
            id: `msg-ai-resp-${Date.now()}`,
            senderId: "bot-gemini",
            senderName: "Gemini Copilot Bot",
            senderAvatar: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=100",
            recipientId: "channel-ai",
            content: data.response,
            createdAt: new Date().toISOString()
          };
          setMessages((prev) => [...prev, aiMsg]);
        }
      } catch (ex) {
        console.error(ex);
      } finally {
        setIsAiResponding(false);
      }
    } else {
      // POST message to API
      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ recipientId: activeChannelId, content: myInput })
        });
        const data = await res.json();
        if (data.success && data.message) {
          // Replace temp with real
          setMessages((prev) => prev.map(m => m.id === tempMsg.id ? data.message : m));
        }
      } catch (e) {
        console.error(e);
      }
    }
  };

  // Auto scroll to message anchor
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isAiResponding]);

  const activeChannel = channels.find(c => c.id === activeChannelId);

  return (
    <div className="h-full flex bg-white border border-[#E5E7EB] rounded-2xl overflow-hidden shadow-sm m-4 lg:m-6" id="chat-workspace">
      
      {/* Channels left rail (Circle.so style) */}
      <div className="w-56 lg:w-64 border-r border-[#E5E7EB] bg-gray-50/50 flex flex-col shrink-0">
        <div className="p-4 border-b border-[#E5E7EB]">
          <h3 className="text-[10px] font-bold tracking-widest text-gray-400 uppercase font-mono">Chat Workspaces</h3>
          <p className="text-[11px] text-gray-500 mt-1">Select discussion category</p>
        </div>
        
        <div className="flex-1 p-2 space-y-1 overflow-y-auto">
          {channels.map((chan) => {
            const isSelected = chan.id === activeChannelId;
            const isBot = chan.id === "channel-ai";
            return (
              <button
                key={chan.id}
                onClick={() => setActiveChannelId(chan.id)}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold text-left transition ${
                  isSelected 
                    ? "bg-indigo-50 text-indigo-900 border border-indigo-100 shadow-[0_1px_2px_rgba(0,0,0,0.01)]"
                    : isBot 
                    ? "text-indigo-600 hover:bg-indigo-50/40"
                    : "text-gray-650 hover:bg-gray-100"
                }`}
              >
                {isBot ? <Bot className="w-4 h-4 text-indigo-500 shrink-0" /> : <MessageCircle className="w-4 h-4 text-gray-400 shrink-0" />}
                <span className="truncate">{chan.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main chat log */}
      <div className="flex-1 flex flex-col bg-white min-w-0">
        
        {/* Active room header details */}
        <div className="p-4 border-b border-[#E5E7EB] bg-gray-50/30 flex justify-between items-center shrink-0">
          <div>
            <h4 className="text-xs font-bold text-gray-900 font-sans">{activeChannel?.name || "Room"}</h4>
            <p className="text-[10px] text-gray-500 mt-0.5 font-sans leading-relaxed truncate">{activeChannel?.desc}</p>
          </div>
          {activeChannelId === "channel-ai" && (
            <span className="px-2 py-0.5 bg-indigo-100 text-indigo-700 rounded-full text-[8.5px] font-bold font-mono tracking-widest uppercase">
              Gemini model
            </span>
          )}
        </div>

        {/* Message body logs scroll container */}
        <div className="flex-1 p-4 overflow-y-auto space-y-4">
          {isLoadingMessages ? (
            <div className="flex items-center justify-center p-12 text-gray-400 text-xs">
              Fetching discussion history...
            </div>
          ) : messages.length === 0 ? (
            <div className="p-12 text-center text-xs text-gray-400">
              No message telemetry recorded here. Start chatting below!
            </div>
          ) : (
            messages.map((m) => {
              const isMe = m.senderId === currentUser?.id;
              const isBot = m.senderId === "bot-gemini";
              return (
                <div key={m.id} className={`flex items-start gap-3 ${isMe ? "justify-end" : ""}`}>
                  {!isMe && (
                    <img
                      src={m.senderAvatar}
                      alt="avatar"
                      referrerPolicy="no-referrer"
                      className="w-8 h-8 rounded-full border object-cover shrink-0 mt-0.5"
                    />
                  )}
                  <div className={`flex flex-col max-w-[70%] ${isMe ? "items-end" : ""}`}>
                    <div className="flex items-center gap-1.5 mb-1 text-[10px] text-gray-400">
                      <span className="font-bold text-gray-700">{m.senderName}</span>
                      <span>•</span>
                      <span className="font-mono">{new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <div className={`p-3 rounded-2xl text-xs leading-relaxed whitespace-pre-wrap ${
                      isMe 
                        ? "bg-indigo-600 text-white shadow-sm rounded-tr-none" 
                        : isBot
                        ? "bg-indigo-50/50 border border-indigo-100/60 text-gray-800 rounded-tl-none font-sans"
                        : "bg-gray-100 text-gray-800 rounded-tl-none"
                    }`}>
                      {m.content}
                    </div>
                  </div>
                </div>
              );
            })
          )}

          {/* AI generating loading skeleton */}
          {isAiResponding && (
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shrink-0 mt-0.5 text-xs font-bold font-mono">
                AI
              </div>
              <div className="flex flex-col space-y-1">
                <span className="text-[10px] text-gray-400 font-bold font-mono uppercase tracking-wider">Gemini Thinking...</span>
                <div className="p-3 bg-indigo-50 border border-indigo-100 text-gray-500 rounded-xl rounded-tl-none text-xs flex items-center gap-2">
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-600" />
                  <span>Configuring response outline based on metadata...</span>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input box */}
        <form onSubmit={handleSendMessage} className="p-4 border-t border-[#E5E7EB] bg-gray-50/50 flex gap-2 shrink-0">
          <input
            type="text"
            required
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={
              activeChannelId === "channel-ai"
                ? "Ask Gemini assistant (e.g. Generate custom SaaS level reward ideas...)"
                : "Type message in channel..."
            }
            className="flex-1 bg-white border border-[#E5E7EB] rounded-xl px-4 py-2.5 text-xs text-gray-950 focus:outline-none focus:ring-1 focus:ring-indigo-500 shadow-sm"
          />
          <button
            type="submit"
            disabled={!inputText.trim() || isAiResponding}
            className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-650 disabled:opacity-50 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-sm transition"
          >
            <SendHorizonal className="w-4 h-4" />
            Send
          </button>
        </form>

      </div>
    </div>
  );
}
