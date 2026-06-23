import asyncio
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from db import pool, init_db
from services.embedder import get_embeddings_worker
from routes import upload, documents, query

@asynccontextmanager
async def lifespan(app: FastAPI):
    # 1. Startup: Open connection pool and initialize schema
    await pool.open()
    await init_db()

    # 2. Startup: Launch background worker for processing uploads
    worker_task = asyncio.create_task(get_embeddings_worker())
    
    yield

    # 3. Teardown: Stop queue and close connections cleanly
    worker_task.cancel()
    await pool.close()

app = FastAPI(lifespan=lifespan)

# Allow react frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Connect all modular endpoints
app.include_router(upload.router)
app.include_router(documents.router)
app.include_router(query.router)
