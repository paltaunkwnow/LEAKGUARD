from app.services.exposure import (
    calculate_real_risk_percent,
    detect_search_type,
    generate_recommendations,
    parse_osint_response,
)

MOCK_OSINT_RESPONSE = {
    "NumOfResults": 5,
    "NumOfDatabase": 2,
    "List": {
        "LeakedDB_2024": {
            "NumOfResults": 3,
            "InfoLeak": "LeakedDB_2024",
            "Data": [
                {"Email": "user@test.com", "Password": "abc123"},
                {"Email": "admin@test.com", "Password": "$2b$12$hashedvalue"},
                {"Email": "otro@test.com", "Pass": "secreto1"},
            ],
        },
        "AnotherDB": {
            "NumOfResults": 2,
            "InfoLeak": "AnotherDB",
            "Data": [
                {"Login": "user2@test.com", "Hash": "5f4dcc3b5aa765d61d8327deb882cf99"},
                {"email": "user3@test.com", "password": "pass"},
            ],
        },
    },
}


def test_parse_osint_response_none():
    records, stats = parse_osint_response(None)
    assert records == []
    assert stats["totalLogins"] == 0


def test_parse_osint_response_empty():
    records, stats = parse_osint_response({})
    assert records == []
    assert stats["totalLogins"] == 0


def test_parse_osint_response_with_data():
    records, stats = parse_osint_response(MOCK_OSINT_RESPONSE)
    assert len(records) == 5
    assert stats["totalLogins"] == 5
    assert stats["totalDatabases"] == 2
    assert stats["plaintextPasswords"] >= 2
    assert stats["hashedPasswords"] >= 1
    for record in records:
        assert "login" in record
        assert "credential" in record
        assert "severity" in record
        assert "•" in record["login"] or "*" in record["login"] or record["login"] == "—"
        if record["credential"] != "—":
            assert "•" in record["credential"]


def test_calculate_risk_no_records():
    result = calculate_real_risk_percent({}, [])
    assert result["score"] == 0
    assert result["level"] == "Sin Riesgo"


def test_calculate_risk_high():
    stats = {
        "apiTotalResults": 100,
        "databasesWithHits": 5,
        "plaintextPasswords": 4,
        "hashedPasswords": 2,
    }
    records = [{"dummy": True}] * 100
    result = calculate_real_risk_percent(stats, records)
    assert result["score"] >= 85
    assert result["level"] == "Crítico"


def test_calculate_risk_low():
    stats = {
        "apiTotalResults": 1,
        "databasesWithHits": 1,
        "plaintextPasswords": 0,
        "hashedPasswords": 1,
    }
    records = [{"dummy": True}]
    result = calculate_real_risk_percent(stats, records)
    assert result["score"] < 35
    assert result["level"] == "Bajo"


def test_detect_search_type():
    assert detect_search_type("test@mail.com", "email") == "Correo Electrónico (Email)"
    assert detect_search_type("empresa.com", "domain") == "Dominio Corporativo"
    assert detect_search_type("+59171234567", "phone") == "Número Telefónico"


def test_generate_recommendations_high_risk():
    risk = {"score": 75, "level": "Alto", "levelClass": "text-orange-400", "barColor": "#f97316"}
    stats = {"apiTotalResults": 10, "plaintextPasswords": 2, "databasesWithHits": 3}
    recs = generate_recommendations("test@mail.com", "Correo Electrónico (Email)", stats, risk)
    priorities = [r["priority"] for r in recs]
    assert "Inmediato" in priorities
