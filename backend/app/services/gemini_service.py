from typing import Any, Dict

import google.generativeai as genai

from ..core.config import get_settings


async def analyze_statement(image_bytes: bytes) -> Dict[str, Any]:
    """
    Recebe uma imagem de extrato enviada pelo Angular,
    chama o Gemini e devolve os dados estruturados.
    """
    settings = get_settings()
    genai.configure(api_key=settings.gemini_api_key)

    # Implementação simples para deixar o esqueleto pronto.
    # Você pode adaptar de acordo com o prompt que quiser.
    model = genai.GenerativeModel("gemini-1.5-flash")
    response = await model.generate_content_async(
        ["Extraia os dados financeiros deste extrato bancário.", {"mime_type": "image/jpeg", "data": image_bytes}]
    )

    return {"raw_text": response.text}

