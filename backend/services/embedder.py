import asyncio
from db import insert_chunks
from config import EMBEDDING_MODEL
from .llm import client

# Global queue for background embedding tasks
embedding_queue = asyncio.Queue()

async def get_embeddings_worker():
    """Background worker that continuously processes the upload queue."""
    while True:
        task_data = await embedding_queue.get()
        document_id = task_data['document_id']
        chunks = task_data['chunks']

        try:
            response = await client.embeddings.create(
                input=chunks, 
                model=EMBEDDING_MODEL
            )
            vectors = [data.embedding for data in response.data]
            records_to_insert = list(zip([document_id] * len(chunks), chunks, vectors))
            await insert_chunks(records_to_insert)

            print(f"Successfully vectorized and stored {len(records_to_insert)} chunks for Doc {document_id}")

        except Exception as e:
            print(f"Error while getting embeddings: {e}")

        finally:
            embedding_queue.task_done()    

async def embed_question(question: str) -> list[float]:
    """Generates an embedding for a user's question."""
    response = await client.embeddings.create(
        input=[question],
        model=EMBEDDING_MODEL
    )
    return response.data[0].embedding
