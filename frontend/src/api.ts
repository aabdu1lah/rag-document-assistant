const BASE_URL = import.meta.env.VITE_BASE_URL;

export interface Document {
    id: number;
    filename: string;   
}

export interface ChatMessage {
    sender: 'user' | 'ai';
    text: string;
    sources?: Source[];
}

export interface Source {
    content: string;
    document_name: string;
    chunk_index: number;
}

export const api = {
    // GET /documents
    async fetchDocuments(): Promise<Document[]> {
        const response = await fetch(`${BASE_URL}/documents`);

        if (!response.ok) throw new Error(`Failed to fetch documents: ${response.statusText}`);
        return response.json();
    },

    // POST /upload
    async uploadDocument(file: File): Promise<{message: string}> {
        const formData = new FormData();
        formData.append('file', file);
        
        const response = await fetch(`${BASE_URL}/upload`, {
            method: 'POST',
            body: formData,
        });
        
        if (!response.ok) throw new Error(`Failed to upload document: ${response.statusText}`);
        return response.json();
    },

    // POST /query
    async sendQuery(question: string, documentId: number | null): Promise<{answer: string, sources: Source[]}> {
        const response = await fetch(`${BASE_URL}/query`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ question, document_id: documentId }),
        });
        if (!response.ok) throw new Error(`Failed to send query: ${response.statusText}`);
        return response.json();
    }
};
