from fastapi import APIRouter, File, UploadFile, HTTPException
from services.extractor import extract_text_from_pdf
from services.embedder import embedding_queue
from services.chunker import chunk_text
from db import create_document

router = APIRouter()

@router.post("/upload")
async def upload(file: UploadFile = File(...)):
    try:
        pdf_bytes = await file.read()
        text = extract_text_from_pdf(pdf_bytes)
        chunks = chunk_text(text)

        document_id = await create_document(file.filename)
        await embedding_queue.put({
            "document_id": document_id,
            "chunks": chunks
        })

    except Exception as e:
        raise HTTPException(status_code=500, detail="Something went wrong during upload")
    
    finally:
        await file.close()

    return {"message": f"Successfully uploaded {file.filename}. Processing in the background."}
