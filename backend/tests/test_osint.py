from app.services.osint import (
    clamp_osint_limit,
    extract_osint_api_error,
    translate_osint_error,
)


def test_clamp_osint_limit_minimum():
    assert clamp_osint_limit(10) == 100
    assert clamp_osint_limit(500) == 500
    assert clamp_osint_limit(99999) == 10000


def test_extract_error_from_status_field():
    data = {
        "Status": "Error",
        "Error code": "The limit value is incorrect. Enter a number from the range 100 to 10000.",
    }
    assert extract_osint_api_error(data) is not None


def test_extract_error_from_top_level_error():
    data = {"error": "You have made too many requests that have invalid data."}
    assert "too many requests" in extract_osint_api_error(data).lower()


def test_extract_balance_error_from_info_leak():
    data = {
        "List": {
            "API": {
                "InfoLeak": "En la API-token, el dinero terminó para ejecutar solicitudes a la API. Balance: 0",
            }
        }
    }
    msg = extract_osint_api_error(data)
    assert msg is not None
    assert "dinero termin" in msg.lower()


def test_translate_balance_error():
    msg = translate_osint_error("En la API-token, el dinero terminó para ejecutar solicitudes")
    assert "Saldo agotado" in msg
