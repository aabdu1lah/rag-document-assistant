from openai import AsyncOpenAI
from config import OPENAI_BASE_URL, OPENAI_API_KEY

# Centralized openai client for embedder and chat routes
client = AsyncOpenAI(base_url=OPENAI_BASE_URL, api_key=OPENAI_API_KEY)
