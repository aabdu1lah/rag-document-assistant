import { Bot, Loader2, Send } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import type { ChatMessage } from "../api";
import { ChatMessageItem } from "./ChatMessage";

interface ChatWindowProps {
  messages: ChatMessage[];
  isQuerying: boolean;
  activeDocumentName?: string;
  onSendQuery: (query: string) => void;
}

export const ChatWindow = ({ messages, isQuerying, activeDocumentName, onSendQuery }: ChatWindowProps) => {
  const [input, setInput] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isQuerying]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isQuerying) return;
    onSendQuery(input.trim());
    setInput('');
  };

  return (
    <div className="flex-1 flex flex-col bg-slate-900">
      {/* Header Banner */}
      <div className="h-16 border-b border-slate-800 flex items-center justify-between px-6 bg-slate-950/40">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-sm font-medium text-slate-300">
            {activeDocumentName ? `Scoping Focus: ${activeDocumentName}` : 'Scoping Focus: All Available Documents'}
          </span>
        </div>
      </div>

      {/* Messages View */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-slate-500 gap-2">
            <Bot className="w-12 h-12 stroke-[1.5] text-slate-600" />
            <p className="text-base font-medium">Your context-aware playground is ready</p>
            <p className="text-xs max-w-sm text-center text-slate-600">
              Upload a document to the knowledge base on the left, then ask targeted questions here.
            </p>
          </div>
        ) : (
          messages.map((msg, idx) => <ChatMessageItem key={idx} msg={msg} />)
        )}

        {isQuerying && (
          <div className="flex gap-4 max-w-3xl mr-auto">
            <div className="w-8 h-8 rounded-lg bg-slate-800 text-indigo-400 flex items-center justify-center flex-shrink-0">
              <Bot className="w-4 h-4" />
            </div>
            <div className="bg-slate-950/60 border border-slate-800 p-4 rounded-2xl rounded-tl-none text-sm text-slate-400 flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-indigo-400" />
              <span>Reading context and formulating reply...</span>
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Input Bar */}
      <div className="p-4 bg-slate-950/30 border-t border-slate-800">
        <form onSubmit={handleSubmit} className="max-w-4xl mx-auto flex gap-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={activeDocumentName ? "Ask something about this document..." : "Ask something about any document..."}
            disabled={isQuerying}
            className="flex-1 bg-slate-950 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none rounded-xl px-4 py-3 text-sm placeholder-slate-500 disabled:opacity-50 transition"
          />
          <button
            type="submit"
            disabled={!input.trim() || isQuerying}
            className="bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 disabled:text-slate-600 text-white p-3 rounded-xl transition flex items-center justify-center shadow-lg"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};