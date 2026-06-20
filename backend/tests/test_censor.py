from app.services.censor import (
    censor_email,
    censor_generic,
    censor_hash,
    censor_password,
    censor_phone,
    normalize_osint_entry,
    severity_from_record,
)


def test_censor_password_masks_value():
    result = censor_password("abc12345")
    assert result != "abc12345"
    assert "•" in result


def test_censor_password_none():
    assert censor_password(None) == "[oculto]"


def test_censor_password_empty():
    assert censor_password("") == "[oculto]"


def test_censor_password_short():
    assert censor_password("ab") == "••••"


def test_censor_password_bcrypt_uses_hash_style():
    result = censor_password("$2b$12$longhashedvalue")
    assert "•" in result


def test_censor_hash():
    result = censor_hash("5f4dcc3b5aa765d61d8327deb882cf99")
    assert result.startswith("5f4dcc3b")
    assert "•" in result


def test_censor_hash_none():
    assert censor_hash(None) == "[hash oculto]"


def test_censor_email():
    result = censor_email("usuario@empresa.com")
    assert "@empresa.com" in result
    assert "*" in result


def test_censor_email_none():
    assert censor_email(None) == "[oculto]"


def test_censor_phone():
    result = censor_phone("+59171234567")
    assert result.startswith("591")
    assert "•" in result
    assert result.endswith("67")


def test_censor_phone_none():
    assert censor_phone(None) == "[oculto]"


def test_censor_generic():
    result = censor_generic("Juan Perez")
    assert "•" in result


def test_normalize_osint_entry():
    entry = normalize_osint_entry({"Email": "a@b.com", "Password": "pass123"})
    assert entry["email"] == "a@b.com"
    assert entry["password"] == "pass123"


def test_severity_from_record_plaintext():
    normalized = normalize_osint_entry({"Email": "a@b.com", "Password": "pass"})
    assert severity_from_record(normalized) == "Critical"


def test_severity_from_record_hash_only():
    normalized = normalize_osint_entry({"Email": "a@b.com", "Hash": "abc123"})
    assert severity_from_record(normalized) == "High"


def test_severity_from_record_email_only():
    normalized = normalize_osint_entry({"Email": "a@b.com"})
    assert severity_from_record(normalized) == "Medium"
