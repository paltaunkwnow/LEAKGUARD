from app.services.scraping import parse_ransomware_victims


def test_parse_ransomware_victims_empty():
    assert parse_ransomware_victims(None) == []
    assert parse_ransomware_victims({}) == []


def test_parse_ransomware_victims_list():
    data = [
        {
            "group_name": "LockBit",
            "post_title": "ACME Corp",
            "discovered": "2026-06-20",
            "post_url": "https://example.com",
            "country": "US",
        }
    ]
    victims = parse_ransomware_victims(data)
    assert len(victims) == 1
    assert victims[0]["actor"] == "LockBit"
    assert victims[0]["victim"] == "ACME Corp"
