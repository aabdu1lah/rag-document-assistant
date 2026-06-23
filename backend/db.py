from config import DATABASE_URL, EMBEDDING_DIMENSIONS
from pgvector.psycopg import register_vector_async
from psycopg_pool import AsyncConnectionPool
from psycopg import AsyncConnection

async def configure_connection(conn):
    # Register pgvector types on every new connection
    await register_vector_async(conn)

# Initialize the connection pool
pool = AsyncConnectionPool(DATABASE_URL, open=False, configure=configure_connection)

async def init_db():
    """Creates extensions and tables. Handles dynamic embedding dimensions."""

    # Standalone connection to bootstrap the vector extension
    async with await AsyncConnection.connect(DATABASE_URL) as setup_conn:
        await setup_conn.execute("CREATE EXTENSION IF NOT EXISTS vector;")
        await setup_conn.commit() # Save the extension

    await pool.open()

    async with pool.connection() as conn:
        async with conn.cursor() as cur:
            # Create documents table
            await cur.execute("""
                CREATE TABLE IF NOT EXISTS documents (
                    id SERIAL PRIMARY KEY,
                    filename VARCHAR(255) NOT NULL
                );
            """)

            # Create document_chunks table with the required dimensions
            await cur.execute(f"""
                CREATE TABLE IF NOT EXISTS document_chunks (
                    id SERIAL PRIMARY KEY,
                    document_id INTEGER REFERENCES documents(id) ON DELETE CASCADE,
                    content TEXT,
                    embedding vector({EMBEDDING_DIMENSIONS})
                );
            """)

            # Attempt to safely alter the dimension if it was updated in the .env file
            try:
                async with conn.transaction():
                    await cur.execute(f"""
                        ALTER TABLE document_chunks
                        ALTER COLUMN embedding TYPE vector({EMBEDDING_DIMENSIONS});
                    """)
            except Exception:
                print(f"Notice: Skipped embedding dimension update. If you intentionally changed dimensions to {EMBEDDING_DIMENSIONS}, you may need to clear the document_chunks table first")
        
        # SAVE THE TABLES!
        await conn.commit()
                
async def create_document(filename: str) -> int:
    """Inserts a new document record and returns its ID."""
    async with pool.connection() as conn:
        async with conn.cursor() as cur:
            await cur.execute("""
                INSERT INTO documents (filename)
                VALUES (%s)
                RETURNING id
            """, (filename,))
            result = await cur.fetchone()
            
        await conn.commit() # SAVE THE ROW!
        return result[0]
    
async def insert_chunks(records: list[tuple]):
    """Inserts multiple chunks and their vectors into the database."""
    async with pool.connection() as conn:
        async with conn.cursor() as cur:
            await cur.executemany("""
                INSERT INTO document_chunks (document_id, content, embedding)
                VALUES (%s, %s, %s)
            """, records)
            
        await conn.commit() # SAVE THE CHUNKS!
    
async def get_all_documents() -> list[dict]:
    """Retrieves all uploaded documents."""
    async with pool.connection() as conn:
        async with conn.cursor() as cur:
            await cur.execute("SELECT id, filename FROM documents")
            results = await cur.fetchall()
    return [{"id": row[0], "filename": row[1]} for row in results]

async def search_similar_chunks(question_embedding: list[float], document_id: int | None = None, limit: int = 5) -> list[dict]:
    async with pool.connection() as conn:
        async with conn.cursor() as cur:
            if document_id:
                # Search ONLY the selected document
                await cur.execute("""
                    SELECT dc.id, dc.content, d.filename
                    FROM document_chunks dc
                    JOIN documents d 
                    ON dc.document_id = d.id
                    WHERE dc.document_id = %s
                    ORDER BY dc.embedding <=> %s::vector
                    LIMIT %s;
                """, (document_id, question_embedding, limit))
            else:
                # Search entire database
                await cur.execute("""
                    SELECT dc.id, dc.content, d.filename
                    FROM document_chunks dc
                    JOIN documents d
                    ON dc.document_id = d.id
                    ORDER BY dc.embedding <=> %s::vector
                    LIMIT %s;
                    """, (question_embedding, limit))

            results = await cur.fetchall()
            return [{ "id": row[0], "content": row[1], "filename": row[2]} for row in results]