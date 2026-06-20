import hashlib


def hash_query(query: str) -> str:
    normalized = query.lower().strip()
    return hashlib.sha256(normalized.encode()).hexdigest()
