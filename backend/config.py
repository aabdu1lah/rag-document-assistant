import os
from dotenv import load_dotenv

load_dotenv('.env.local')

DATABASE_URL = os.environ.get("DATABASE_URL")

OPENAI_API_KEY = os.environ.get("OPENAI_API_KEY")
OPENAI_BASE_URL = os.environ.get("OPENAI_BASE_URL")

EMBEDDING_MODEL = os.environ.get("EMBEDDING_MODEL")
EMBEDDING_DIMENSIONS = os.environ.get("EMBEDDING_DIMENSIONS")

CHAT_MODEL = os.environ.get("CHAT_MODEL")

CHUNK_SIZE = int(os.environ.get("CHUNK_SIZE"))
CHUNK_OVERLAP = int(os.environ.get("CHUNK_OVERLAP"))
