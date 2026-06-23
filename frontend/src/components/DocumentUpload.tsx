import { Loader2, Upload } from "lucide-react";
import { useState, useRef } from "react";
import { api } from "../api";

export const DocumentUpload = ({ onUploadSuccess }: { onUploadSuccess: () => Promise<void> }) => {
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      await api.uploadDocument(file);
      await onUploadSuccess();
    } catch (err) {
      alert('Failed to upload document');
      console.error(err);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <>
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileUpload} 
        accept=".pdf" 
        className="hidden" 
      />
      <button
        onClick={() => fileInputRef.current?.click()}
        disabled={isUploading}
        className="w-full mb-6 py-3 px-4 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-800 transition rounded-xl font-medium flex items-center justify-center gap-2 shadow-lg shadow-indigo-950/50"
      >
        {isUploading ? (
          <><Loader2 className="w-5 h-5 animate-spin" /><span>Processing PDF...</span></>
        ) : (
          <><Upload className="w-5 h-5" /><span>Upload Document</span></>
        )}
      </button>
    </>
  );
};