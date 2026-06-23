from langchain_text_splitters import RecursiveCharacterTextSplitter
from config import CHUNK_OVERLAP, CHUNK_SIZE

splitter = RecursiveCharacterTextSplitter(
    chunk_size=CHUNK_SIZE, 
    chunk_overlap=CHUNK_OVERLAP
)

def chunk_text(text: str) -> list[str]:
    """Splits large text into smaller semantic chunks."""
    return splitter.split_text(text)