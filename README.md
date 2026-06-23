# RAG Document Knowledge Assistant

A full-stack AI application that lets you upload PDF documents and ask questions about them in plain English. Every answer is grounded strictly in your uploaded content — with cited source excerpts shown alongside each response so you can verify exactly where the answer came from.

Built with FastAPI, React, PostgreSQL + pgvector, and the OpenAI API (or any OpenAI-compatible local LLM via LM Studio).

https://github.com/user-attachments/assets/da8fae87-8104-4d3b-9abe-02bed957ae18

---

## What it does

- **Upload PDFs** — drag and drop any PDF into the knowledge base
- **Ask questions** — type a question in plain English, get a direct answer
- **See your sources** — every answer shows the exact document excerpts it was drawn from
- **Switch documents** — select a specific document to scope your queries to, or query across all uploaded documents
- **Hallucination-resistant** — if the answer isn't in your documents, the system says so rather than guessing

---

## How it works

```
Upload flow
──────────────────────────────────────────────────────────
PDF uploaded → text extracted (PyMuPDF) → split into chunks
→ each chunk embedded (nomic-embed-text / OpenAI)
→ chunks + vectors stored in PostgreSQL (pgvector)

Query flow
──────────────────────────────────────────────────────────
User asks question → question embedded with same model
→ pgvector similarity search → top 5 matching chunks retrieved
→ chunks + question sent to LLM → grounded answer generated
→ answer + source chunks returned to UI
```

The key design decision: the LLM never answers from its own training knowledge. It only has access to the chunks retrieved from your documents. If the relevant information isn't there, it says so.

---

## Tech stack

| Layer | Technology |
|---|---|
| Frontend | React, Tailwind CSS |
| Backend | FastAPI (Python) |
| Database | PostgreSQL + pgvector extension |
| Embeddings | `nomic-embed-text` (local) / `text-embedding-3-small` (OpenAI) |
| LLM | Llama 3.2 3B Instruct (local) / `gpt-4o-mini` (OpenAI) |
| PDF extraction | PyMuPDF |
| Local LLM hosting | LM Studio (OpenAI-compatible API) |

---

## Project structure

```
rag-document-assistant/
├── backend/
│   ├── main.py              # FastAPI app entry point
│   ├── routes/
│   │   ├── upload.py        # PDF upload + chunking + embedding
│   │   ├── query.py         # Question answering + retrieval
│   │   └── documents.py     # List all uploaded documents
│   ├── services/
│   │   ├── extractor.py     # PyMuPDF text extraction
│   │   ├── chunker.py       # Text splitting logic
│   │   ├── embedder.py      # OpenAI / LM Studio embedding calls
│   │   ├── llm.py           # Centralized LLM Connection client
│   ├── db.py                # PostgreSQL connection + schema
│   ├── config.py            # Centralized environment variables
│   ├── requirements.txt
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── api.ts                   # Centralized API service layer
│   │   ├── components/
│   │   │   ├── ChatMessage.tsx      # Message thread + input form
│   │   │   ├── ChatWindow.tsx       # Message thread + input form
│   │   │   ├── DocumentUpload.tsx   # Hidden input + upload logic
│   │   │   └── DocumentList.tsx     # Uploaded docs + scope selection
│   │   ├── App.tsx                  # Main layout and global state
│   │   ├── main.tsx                 # React DOM entry point
│   │   └── index.css                # Tailwind CSS imports
│   ├── package.json
│   └── .env.example
```
---

## Setup

### Prerequisites

```
- Python 3.10+
- Node.js 18+
- PostgreSQL 15+ 
- LM Studio (for local LLM) **or** an OpenAI API key
```

### 1. Clone the repository

```bash
git clone [https://github.com/aabdu1lah/rag-document-assistant.git](https://github.com/aabdu1lah/rag-document-assistant.git)
cd rag-document-assistant
```

### 2. Set up the database

```
The FastAPI backend is configured to automatically install the `pgvector` extension and apply the database schema on startup.

Simply ensure your PostgreSQL server is running and your backend `.env` file is configured with the correct database credentials before starting the server.
```

### 3. Configure environment variables

```bash
cd backend
cp .env.example .env
# Edit .env with your values (see Environment Variables section below)

cd frontend
cp .env.example .env
# Edit .env with your values (see Environment Variables section below)
```

*(Note: If you are testing on a mobile device or another computer on your network, ensure your frontend's `VITE_BASE_URL` points to your computer's local IP address, e.g., `http://192.168.100.75:8000` and that
you have configured CORS accordingly).*

### 4. Install backend dependencies

```bash
cd backend
pip install -r requirements.txt
```

### 5. Install frontend dependencies

```bash
cd frontend
npm install
```

### 6. Start both servers

```bash
# Terminal 1 — Backend (Exposed to local network)
cd backend
uvicorn main:app --host 0.0.0.0 --port 8000 --reload

# Terminal 2 — Frontend (Exposed to local network)
cd frontend
npm run dev -- --host
```

Visit `http://localhost:5173` on your machine, or `http://<your-local-ip>:5173` from another device on your Wi-Fi network.

## Environment variables

Copy `.env.example` to `.env` and fill in the following:

| Variable | Description | Example |
|---|---|---|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@localhost:5432/ragdb` |
| `OPENAI_API_KEY` | OpenAI API key **or** any non-empty string for local LLM | `sk-...` or `lm-studio` |
| `OPENAI_BASE_URL` | API base URL — point at LM Studio locally or OpenAI in production | `http://localhost:1234/v1` |
| `EMBEDDING_MODEL` | Embedding model name | `nomic-embed-text` or `text-embedding-3-small` |
| `EMBEDDING_DIMENSIONS` | Vector dimensions — must match your embedding model | `768` (nomic) or `1536` (OpenAI) |
| `CHAT_MODEL` | LLM model name | `llama-3.2-3b-instruct` or `gpt-4o-mini` |
| `CHUNK_SIZE` | Target token size per chunk | `500` |
| `CHUNK_OVERLAP` | Overlap between adjacent chunks | `50` |
| `VITE_BASE_URL` | Backend URL | `http://localhost:8000` |

---

## API endpoints

### `POST /upload`

Upload a PDF file to the knowledge base.

**Request:** `multipart/form-data` with a `file` field.

**Response:**

```json
{
  "message": "Successfully uploaded policy.pdf. Processing in the background."
}

```

---

### `POST /query`

Ask a question against the knowledge base.

**Request:**

```json
{
  "question": "What is the cancellation policy?",
  "document_id": 1   // optional — omit (or send null) to query all documents
}

```

**Response:**

```json
{
  "answer": "Cancellations made more than 48 hours in advance are fully refunded...",
  "sources": [
    {
      "content": "...cancellations received less than 48 hours prior to arrival...",
      "document_name": "hotel_policy.pdf",
      "chunk_index": 12
    }
  ]
}

```

---

### `GET /documents`

Returns a list of all uploaded documents.

**Response:**

```json
[
  {
    "id": 1,
    "filename": "hotel_policy.pdf"
  },
  {
    "id": 2,
    "filename": "employee_handbook.pdf"
  }
]

```

## Switching between local LLM and OpenAI

The backend uses the OpenAI Python SDK for both local and cloud inference — LM Studio exposes an OpenAI-compatible API, so no code changes are needed. Simply update your `.env`:

**Local (LM Studio):**
```env
OPENAI_BASE_URL=http://192.168.x.x:1234/v1
OPENAI_API_KEY=lm-studio
EMBEDDING_MODEL=nomic-embed-text
EMBEDDING_DIMENSIONS=768
CHAT_MODEL=llama-3.2-3b-instruct
```

**Production (OpenAI):**
```env
OPENAI_BASE_URL=https://api.openai.com/v1
OPENAI_API_KEY=sk-your-real-key
EMBEDDING_MODEL=text-embedding-3-small
EMBEDDING_DIMENSIONS=1536
CHAT_MODEL=gpt-4o-mini
```

> **Note:** If you switch embedding models, you must re-upload your documents. The vector dimensions differ between models (768 vs 1536), so existing embeddings are incompatible with a new model.

---

## Known limitations

- **Scanned PDFs** — PyMuPDF extracts text from text-layer PDFs only. Scanned documents (photos of pages) will return empty or garbled output. OCR support is not currently implemented.
- **Large files** — Very large PDFs (100+ pages) may take several seconds to process on upload. No progress indicator is shown during chunking and embedding.
- **Single language** — The system works best with English-language documents. Retrieval quality degrades with non-Latin scripts depending on the embedding model used.
- **No authentication** — This is a single-tenant application with no login layer. Not suitable for production deployment without adding auth.

---

## License

MIT
