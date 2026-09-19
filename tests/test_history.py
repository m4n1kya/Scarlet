"""Tests for SCARLET detection history storage."""
import pytest
import tempfile
import os
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent))

from src.storage.history import DetectionHistory


@pytest.fixture
def temp_db():
    """Create a temporary database for testing."""
    fd, path = tempfile.mkstemp(suffix=".db")
    os.close(fd)
    yield path
    if os.path.exists(path):
        os.remove(path)


class TestDetectionHistory:
    """Test SQLite history storage."""

    def test_init_creates_db(self, temp_db):
        history = DetectionHistory(db_path=temp_db)
        assert os.path.exists(temp_db)

    def test_save_and_retrieve(self, temp_db):
        history = DetectionHistory(db_path=temp_db)
        record_id = history.save(
            filename="test.jpg", media_type="image",
            fire_count=2, smoke_count=1, default_count=0,
            total_detections=3, max_confidence=0.85,
            avg_confidence=0.72, risk_level="HIGH"
        )
        assert record_id is not None
        assert record_id > 0

        records = history.get_all()
        assert len(records) == 1
        assert records[0]["filename"] == "test.jpg"
        assert records[0]["fire_count"] == 2
        assert records[0]["risk_level"] == "HIGH"

    def test_get_recent(self, temp_db):
        history = DetectionHistory(db_path=temp_db)
        for i in range(5):
            history.save(
                filename=f"test_{i}.jpg", media_type="image",
                fire_count=i, smoke_count=0, default_count=0,
                total_detections=i, max_confidence=0.5,
                avg_confidence=0.5, risk_level="LOW"
            )
        recent = history.get_recent(limit=3)
        assert len(recent) == 3

    def test_get_stats(self, temp_db):
        history = DetectionHistory(db_path=temp_db)
        history.save(
            filename="a.jpg", media_type="image",
            fire_count=3, smoke_count=2, default_count=0,
            total_detections=5, max_confidence=0.9,
            avg_confidence=0.7, risk_level="HIGH"
        )
        history.save(
            filename="b.jpg", media_type="image",
            fire_count=1, smoke_count=0, default_count=0,
            total_detections=1, max_confidence=0.6,
            avg_confidence=0.6, risk_level="MODERATE"
        )
        stats = history.get_stats()
        assert stats["total_analyses"] == 2
        assert stats["total_fire"] == 4
        assert stats["total_smoke"] == 2

    def test_clear(self, temp_db):
        history = DetectionHistory(db_path=temp_db)
        history.save(
            filename="test.jpg", media_type="image",
            fire_count=1, smoke_count=0, default_count=0,
            total_detections=1, max_confidence=0.5,
            avg_confidence=0.5, risk_level="LOW"
        )
        assert len(history.get_all()) == 1
        history.clear()
        assert len(history.get_all()) == 0

    def test_delete(self, temp_db):
        history = DetectionHistory(db_path=temp_db)
        rid = history.save(
            filename="test.jpg", media_type="image",
            fire_count=1, smoke_count=0, default_count=0,
            total_detections=1, max_confidence=0.5,
            avg_confidence=0.5, risk_level="LOW"
        )
        history.delete(rid)
        assert len(history.get_all()) == 0
