import { FileText } from "lucide-react";
import type { Document } from "../api";

interface DocumentListProps {
  documents: Document[];
  activeDocId: number | null;
  onSelectDoc: (id: number | null) => void;
}

export const DocumentList = ({ documents, activeDocId, onSelectDoc }: DocumentListProps) => {
  return (
    <div className="flex-1 overflow-y-auto">
      <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-3 px-2">
        Your Knowledge Base
      </h2>
      {documents && documents.length === 0 ? (
        <p className="text-sm text-slate-500 italic px-2 py-4">No documents uploaded yet.</p>
      ) : (
        <div className="space-y-1">
          <button
            onClick={() => onSelectDoc(null)}
            className={`w-full text-left p-3 rounded-xl flex items-center gap-3 text-sm transition font-medium ${
              activeDocId === null 
                ? 'bg-indigo-600/10 text-indigo-400 border border-indigo-500/20' 
                : 'text-slate-400 hover:bg-slate-900'
            }`}
          >
            <FileText className="w-4 h-4 flex-shrink-0" />
            <span className="truncate">Search Entire Corpus</span>
          </button>

          {documents && documents.map((doc) => (
            <button
              key={doc.id}
              onClick={() => onSelectDoc(doc.id)}
              className={`w-full text-left p-3 rounded-xl flex items-center gap-3 text-sm transition ${
                activeDocId === doc.id 
                  ? 'bg-indigo-600/10 text-indigo-400 border border-indigo-500/20 font-medium' 
                  : 'text-slate-400 hover:bg-slate-900'
              }`}
            >
              <FileText className="w-4 h-4 flex-shrink-0" />
              <span className="truncate">{doc.filename}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
