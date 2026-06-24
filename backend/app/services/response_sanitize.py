import json
import re
from typing import Any

from app.services.censor import censor_generic

PUBLIC_RECORD_KEYS = frozenset(
    {
        "date",
        "title",
        "sourceName",
        "login",
        "credential",
        "severity",
        "source",
        "indicators",
        "id",
        "actor",
        "victim",
        "sector",
        "country",
        "riskScore",
        "confidence",
        "status",
        "verificationStatus",
    }
)

FORBIDDEN_RECORD_KEYS = frozenset(
    {
        "normalized",
        "raw",
        "password",
        "email",
        "hash",
        "phone",
        "name",
    }
)

EMAIL_PATTERN = re.compile(r"[\w.+-]+@[\w.-]+\.\w+")


def build_public_breach_record(
    *,
    entry_date: str,
    source_name: str,
    login_display: str,
    credential: str,
    severity: str,
    source: str | None = None,
    indicators: str | None = None,
) -> dict[str, Any]:
    record: dict[str, Any] = {
        "date": entry_date,
        "title": source_name,
        "sourceName": source_name,
        "login": login_display,
        "credential": credential,
        "severity": severity,
    }
    if source:
        record["source"] = source
    if indicators:
        record["indicators"] = sanitize_indicators(indicators)
    return record


def sanitize_indicators(value: str) -> str:
    text = str(value).strip()[:120]
    if EMAIL_PATTERN.search(text):
        return censor_generic(text)
    return text


def sanitize_exposure_record(record: dict[str, Any]) -> dict[str, Any]:
    return {key: value for key, value in record.items() if key in PUBLIC_RECORD_KEYS}


def sanitize_scan_records(records: list[dict[str, Any]]) -> list[dict[str, Any]]:
    return [sanitize_exposure_record(record) for record in records]


def sanitize_scan_response(payload: dict[str, Any]) -> dict[str, Any]:
    sanitized = dict(payload)
    if isinstance(sanitized.get("records"), list):
        sanitized["records"] = sanitize_scan_records(sanitized["records"])
    return sanitized


def response_contains_plaintext_secrets(payload: dict[str, Any], secrets: list[str]) -> list[str]:
    serialized = json.dumps(payload, ensure_ascii=False).lower()
    return [secret for secret in secrets if secret and secret.lower() in serialized]
