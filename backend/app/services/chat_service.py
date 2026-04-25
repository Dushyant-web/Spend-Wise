"""
Public AI chat service — answers questions about SpendWise on the landing page.
Uses NVIDIA NIM API (OpenAI-compatible endpoint).
"""
import httpx
import structlog

from app.config import settings

log = structlog.get_logger()

SYSTEM_PROMPT = """You are the SpendWise AI assistant on the landing page. SpendWise AI is a free expense tracking app built for Indian college students.

Key features:
- Track expenses with 10 categories (Food, Transport, Shopping, Entertainment, Health, Education, Rent, Utilities, Travel, Other)
- Support for all Indian payment modes: UPI, Cash, Card, Net Banking, Wallet
- AI-powered spending predictions and anomaly detection
- Smart budget alerts at 80% and 100% of monthly limit
- Gamification: XP points, streaks, 16 achievement badges, levels
- Analytics: category breakdown, monthly trends, top merchants
- CSV import/export
- Completely free, no premium tier

Keep answers short (2-4 sentences), friendly, and relevant to Indian college students. If asked something unrelated to SpendWise or personal finance, politely redirect to SpendWise features. Never make up features that don't exist."""


class ChatService:
    async def chat(self, message: str) -> str:
        if not settings.NVIDIA_API_KEY:
            return "AI chat is not configured yet. Please check out our features above or sign up to get started!"

        try:
            async with httpx.AsyncClient(timeout=20.0) as client:
                resp = await client.post(
                    "https://integrate.api.nvidia.com/v1/chat/completions",
                    headers={
                        "Authorization": f"Bearer {settings.NVIDIA_API_KEY}",
                        "Content-Type": "application/json",
                    },
                    json={
                        "model": settings.NVIDIA_MODEL,
                        "messages": [
                            {"role": "system", "content": SYSTEM_PROMPT},
                            {"role": "user", "content": message[:500]},
                        ],
                        "max_tokens": 200,
                        "temperature": 0.7,
                    },
                )
                resp.raise_for_status()
                data = resp.json()
                return data["choices"][0]["message"]["content"].strip()
        except Exception as e:
            log.warning("chat_service_error", error=str(e))
            return "Sorry, I'm having trouble connecting right now. Feel free to sign up and explore SpendWise AI yourself — it's completely free!"
