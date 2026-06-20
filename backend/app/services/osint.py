import httpx

from app.core.config import settings

UPSTREAM = "https://leakosintapi.com/"

_API_ERROR_MARKERS = (
    "api-token",
    "dinero termin",
    "balance",
    "saldo agot",
    "limit value is incorrect",
    "too many requests",
    "invalid data",
)


def clamp_osint_limit(limit: int) -> int:
    """LeakOsint acepta limit entre 100 y 10_000 (documentación oficial)."""
    return min(10000, max(100, limit))


def extract_osint_api_error(data: dict | None) -> str | None:
    if not isinstance(data, dict):
        return None

    if data.get("Status") == "Error":
        return str(data.get("Error code") or data.get("error") or "Error del motor OSINT")

    err = data.get("error") or data.get("Error")
    if isinstance(err, str) and err.strip():
        return err.strip()

    lst = data.get("List") or data.get("list") or {}
    if isinstance(lst, dict):
        for source_data in lst.values():
            if not isinstance(source_data, dict):
                continue
            info = source_data.get("InfoLeak") or source_data.get("info") or ""
            if isinstance(info, str):
                lower = info.lower()
                if any(marker in lower for marker in _API_ERROR_MARKERS):
                    return info[:400]
    return None


def translate_osint_error(message: str) -> str:
    lower = message.lower()
    if "limit value is incorrect" in lower or "range 100" in lower or "rango 100" in lower:
        return "Límite de búsqueda inválido: LeakOsint acepta entre 100 y 10.000 resultados."
    if "too many requests" in lower or "invalid data" in lower:
        return "Demasiadas solicitudes inválidas al motor OSINT. Espera 30 segundos e inténtalo de nuevo."
    if "dinero termin" in lower or "balance" in lower or "api-token" in lower:
        return (
            "Saldo agotado en el token LeakOsint. Recarga créditos en el bot de Telegram (/api) "
            "o actualiza OSINT_TOKEN en backend/.env."
        )
    if "token" in lower and ("invalid" in lower or "incorrect" in lower or "not found" in lower):
        return "OSINT_TOKEN inválido. Verifica backend/.env."
    return message


async def query_osint(request: str, limit: int = 500, lang: str = "es") -> dict:
    if not settings.osint_token:
        raise ValueError("OSINT_TOKEN no configurado en backend/.env")

    safe_limit = clamp_osint_limit(limit)
    payload = {
        "token": settings.osint_token,
        "request": request.strip(),
        "limit": safe_limit,
        "lang": lang or "es",
    }

    async with httpx.AsyncClient(timeout=60.0) as client:
        response = await client.post(UPSTREAM, json=payload)

    try:
        data = response.json()
    except Exception as exc:
        raise ValueError("Respuesta inválida del motor de indexación") from exc

    if not isinstance(data, dict):
        raise ValueError("Respuesta inválida del motor de indexación")

    api_error = extract_osint_api_error(data)
    if api_error:
        raise ValueError(translate_osint_error(api_error))

    if not response.is_success:
        body_error = data.get("error") or data.get("Error code") or data.get("Error")
        message = str(body_error) if body_error else f"Motor OSINT respondió HTTP {response.status_code}"
        raise ValueError(translate_osint_error(message))

    return data
