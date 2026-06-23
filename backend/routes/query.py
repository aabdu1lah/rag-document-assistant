from fastapi import APIRouter, HTTPException
from services.embedder import embed_question
from db import search_similar_chunks
from services.llm import client
from pydantic import BaseModel
from config import CHAT_MODEL

router = APIRouter()

class QueryRequest(BaseModel):
    question: str
    document_id: int | None = None

@router.post("/query")
async def query(request: QueryRequest):
    try:
        # 1. Embed the question
        question_embedding = await embed_question(request.question)

        # 2. Retrieve relevant chunks
        retreived_chunks = await search_similar_chunks(question_embedding, request.document_id)

        if not retreived_chunks:
            return {"answer": "No relevant information found in the documents."}

        # 3. Compile context
        context = "\n\n".join([chunk["content"] for chunk in retreived_chunks])
        
        system_prompt = """You are a helpful assistant that answers questions based strictly on the provided document excerpts.
        Rules:
            - Only use information from the provided context
            - If the answer isn't in the context, say "I couldn't find that in the document"
            - Keep answers concise and direct"""

        user_prompt = f"Context:\n{context}\n\nQuestion: {request.question}\nAnswer:"

        # 4. Generate Answer
        chat_response = await client.chat.completions.create(
            model=CHAT_MODEL,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            temperature=0.2,
        )

        final_answer = chat_response.choices[0].message.content.strip()

        return {
            "answer": final_answer,
            "sources": [
                {
                    "content": chunk["content"],
                    "document_name": chunk["filename"],
                    "chunk_index": chunk["id"],
                }
                for chunk in retreived_chunks
            ]
        }
    
    except Exception as e:
        print(f"Error during query processing: {e}")
        raise HTTPException(status_code=500, detail='Something went wrong while processing the query')
    
