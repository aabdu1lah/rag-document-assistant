import { useState } from 'react';
import { Sparkles, Loader2 } from 'lucide-react'; // Added Loader2 for the spinner
import { DocumentUpload } from './DocumentUpload';
import { DocumentList } from './DocumentList';
import { type Document, api } from "../api";

interface SidebarProps {
  documents: Document[];
  activeDocId: number | null;
  setActiveDocId: (id: number | null) => void;
  loadDocs: () => Promise<void>; 
}

export default function Sidebar({ documents, activeDocId, setActiveDocId, loadDocs }: SidebarProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [isUploading, setIsUploading] = useState(false); // 1. Added upload state

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault(); 
    if (isUploading) return; // Prevent drag interactions while already uploading
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    
    // Prevent dropping new files if an upload is actively running
    if (isUploading) return;

    const files = e.dataTransfer.files;
    if (!files || files.length === 0) return;

    setIsUploading(true); // 2. Turn loading state ON before processing files
    
    try {
      for (const file of Array.from(files)) {
        await api.uploadDocument(file);
      }
      
      await loadDocs();
    } catch (err) {
      alert('Failed to upload one or more documents');
      console.error(err);
    } finally {
      setIsUploading(false); // 3. Turn loading state OFF when everything finishes (or fails)
    }
  };

  return (
    <div 
      id="sidebar"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      /* Added 'relative' so the loading overlay snaps perfectly to this container */
      className={`
        relative w-[250px] border-r border-slate-800 flex flex-col p-4 transition-all duration-300 ease-in-out
        ${isDragOver 
          ? 'bg-slate-900/80 backdrop-blur-md border-2 border-dashed border-indigo-500' 
          : 'bg-slate-950 border-transparent border-2'
        }
      `}
    >
      {/* 4. Elegant Upload Overlay */}
      {isUploading && (
        <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-xs flex flex-col items-center justify-center gap-2 z-50 rounded-r-xl">
          <Loader2 className="w-6 h-6 text-indigo-400 animate-spin" />
          <p className="text-xs text-slate-400 font-medium tracking-wide">Processing vectors...</p>
        </div>
      )}

      <div className="flex items-center gap-2 mb-6 px-2">
        <Sparkles className="w-6 h-6 text-indigo-400" />
        <h1 className="text-xl font-bold tracking-tight bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">
          RAG Dashboard
        </h1>
      </div>

      {/* Upload Component */}
      <DocumentUpload onUploadSuccess={loadDocs} />

      {/* Document List Component */}
      <DocumentList 
        documents={documents} 
        activeDocId={activeDocId} 
        onSelectDoc={setActiveDocId} 
      />
    </div>
  );
}