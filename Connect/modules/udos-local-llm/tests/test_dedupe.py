from udos_llm.ingest.dedupe import content_hash, record_hash, seen_before


def test_hash_stable():
    h1 = content_hash("hello")
    h2 = content_hash("hello")
    assert h1 == h2
    assert not seen_before(h1)
    record_hash(h1)
    assert seen_before(h1)
