import { useState, useEffect } from "react";
import { type ChatMessage, type Document, api  } from "./api";
import { ChatWindow } from "./components/ChatWindow";
import Sidebar from "./components/Sidebar";

export default function App() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [activeDocId, setActiveDocId] = useState<number | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isQuerying, setIsQuerying] = useState(false);

  useEffect(() => {
    loadDocs();
  }, []);

  const loadDocs = async () => {
    try {
      const data = await api.fetchDocuments();
      setDocuments(data);
    } catch (err) {
      console.error('Failed to load documents:', err);
    }
  };

  const handleSendQuery = async (queryText: string) => {
    setMessages((prev) => [...prev, { sender: 'user', text: queryText }]);
    setIsQuerying(true);

    try {
      const response = await api.sendQuery(queryText, activeDocId);
      setMessages((prev) => [
        ...prev,
        { sender: 'ai', text: response.answer, sources: response.sources }
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { sender: 'ai', text: 'Sorry, I encountered an error trying to process that request.' }
      ]);
    } finally {
      setIsQuerying(false);
    }
  };

  const activeDocumentName = documents && documents.find(d => d.id === activeDocId)?.filename;

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-900 text-slate-100 font-sans">

      {/* Sidebar Layout */}
      <Sidebar 
        documents={documents} 
        activeDocId={activeDocId} 
        setActiveDocId={setActiveDocId} 
        loadDocs={loadDocs} 
      />

      {/* Main Chat Layout */}
      <ChatWindow 
        messages={messages}
        isQuerying={isQuerying}
        activeDocumentName={activeDocumentName}
        onSendQuery={handleSendQuery}
      />
    </div>
  );
}