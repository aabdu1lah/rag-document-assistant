import io
import pymupdf
import pymupdf4llm

def extract_text_from_pdf(pdf_bytes: bytes) -> str:
    """Extracts raw text from a PDF binary stream."""
    pdf_stream = io.BytesIO(pdf_bytes)
    doc = pymupdf.open(stream=pdf_stream, filetype="pdf")
    text = pymupdf4llm.to_text(doc).replace("\n", " ")
    return text