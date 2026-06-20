from app.services.k_anonymity import hash_query


def test_hash_query_deterministic():
    assert hash_query("test.com") == hash_query("test.com")
    assert hash_query("Test.COM") == hash_query("test.com")


def test_hash_query_length():
    assert len(hash_query("empresa.com")) == 64
