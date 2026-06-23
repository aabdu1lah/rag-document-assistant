from fastapi import APIRouter, HTTPException
from db import get_all_documents

router = APIRouter()

@router.get("/documents")
async def get_documents():
    try: 
        return await get_all_documents()
    except Exception as e:
        print(f"Error fetching documents: {e}")
        raise HTTPException(status_code=500, detail='Something went wrong while fetching documents')
    