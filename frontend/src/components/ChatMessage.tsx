import { User, Bot, ScrollText, ChevronDown } from "lucide-react";
import { useState } from "react";
import type { ChatMessage } from "../api";

export const ChatMessageItem = ({ msg }: { msg: ChatMessage }) => {
  const [showSources, setShowSources] = useState(false);
  const isUser = msg.sender === 'user';

  return (
    <div className={`flex gap-4 max-w-3xl ${isUser ? 'ml-auto flex-row-reverse' : 'mr-auto'}`}>
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
        isUser ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-indigo-400'
      }`}>
        {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
      </div>
      
      <div className="flex flex-col gap-2 min-w-0">
        <div className={`p-4 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap shadow-md ${
          isUser 
            ? 'bg-indigo-600 text-white rounded-tr-none' 
            : 'bg-slate-950/60 border border-slate-800 text-slate-200 rounded-tl-none'
        }`}>
          {msg.text}
        </div>

        {msg.sources && msg.sources.length > 0 && (
          <div className="mt-1 flex flex-col items-start">
            <button 
              onClick={() => setShowSources(!showSources)}
              className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-indigo-400 transition-colors py-1 px-2 rounded-md hover:bg-slate-800/50"
            >
              <ScrollText className="w-3 h-3" />
              {showSources ? "Hide" : "View"} {msg.sources.length} source{msg.sources.length > 1 ? 's' : ''}
              <ChevronDown className={`w-3 h-3 transition-transform ${showSources ? 'rotate-180' : ''}`} />
            </button>

            {showSources && (
              <div className="mt-2 space-y-2 w-full">
                {msg.sources.map((source, i) => (
                  <div key={i} className="bg-slate-950/80 border border-slate-800/80 rounded-lg p-3 text-xs shadow-sm">
                    <div className="flex items-center gap-2 mb-2 pb-2 border-b border-slate-800/50">
                      <span className="bg-indigo-500/20 text-indigo-300 px-1.5 py-0.5 rounded text-[10px] font-medium uppercase tracking-wider">
                        Source {i + 1}
                      </span>
                      <span className="text-slate-400 font-medium truncate">{source.document_name}</span>
                    </div>
                    <p className="text-slate-500 leading-relaxed italic line-clamp-3 hover:line-clamp-none transition-all cursor-ns-resize">
                      "{source.content}"
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};