import json

from app.services.exposure import parse_osint_response
from app.services.response_sanitize import (
    build_public_breach_record,
    response_contains_plaintext_secrets,
    sanitize_scan_response,
)

MOCK_OSINT_RESPONSE = {
    "NumOfResults": 2,
    "NumOfDatabase": 1,
    "List": {
        "LeakedDB_2024": {
            "NumOfResults": 2,
            "Data": [
                {"Email": "user@test.com", "Password": "abc123"},
                {"Email": "admin@test.com", "Pass": "secreto1"},
            ],
        }
    },
}


def test_build_public_breach_record_has_no_sensitive_keys():
    record = build_public_breach_record(
        entry_date="2024-01-01",
        source_name="LeakedDB",
        login_display="us***@test.com",
        credential="ab••••23",
        severity="Critical",
    )
    assert "normalized" not in record
    assert "password" not in record
    assert "email" not in record


def test_parse_osint_response_excludes_normalized():
    records, _ = parse_osint_response(MOCK_OSINT_RESPONSE)
    assert len(records) == 2
    for record in records:
        assert "normalized" not in record
        assert "raw" not in record


def test_parse_osint_response_json_has_no_plaintext_passwords():
    records, _ = parse_osint_response(MOCK_OSINT_RESPONSE)
    payload = sanitize_scan_response({"records": records})
    leaked = response_contains_plaintext_secrets(payload, ["abc123", "secreto1", "user@test.com"])
    assert leaked == []


def test_sanitize_scan_response_strips_normalized_if_present():
    payload = {
        "query": "test.com",
        "records": [
            {
                "login": "us***@test.com",
                "credential": "ab••••23",
                "normalized": {"password": "abc123", "email": "user@test.com"},
            }
        ],
    }
    sanitized = sanitize_scan_response(payload)
    serialized = json.dumps(sanitized)
    assert "normalized" not in serialized
    assert "abc123" not in serialized
