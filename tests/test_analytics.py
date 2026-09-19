"""Tests for SCARLET analytics module."""
import pytest
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent))

from src.analytics.analyzer import ScarletAnalyzer


def make_history_records():
    """Create sample history records for testing."""
    return [
        {
            "id": 1, "timestamp": "2026-01-01 12:00:00",
            "filename": "test1.jpg", "media_type": "image",
            "fire_count": 3, "smoke_count": 1, "default_count": 0,
            "total_detections": 4, "max_confidence": 0.9,
            "avg_confidence": 0.75, "risk_level": "HIGH"
        },
        {
            "id": 2, "timestamp": "2026-01-02 14:00:00",
            "filename": "test2.mp4", "media_type": "video",
            "fire_count": 0, "smoke_count": 2, "default_count": 1,
            "total_detections": 3, "max_confidence": 0.6,
            "avg_confidence": 0.45, "risk_level": "MODERATE"
        },
    ]


class TestScarletAnalyzer:
    """Test analytics chart generation."""

    def test_detection_summary_chart(self):
        fig = ScarletAnalyzer.detection_summary_chart(make_history_records())
        assert fig is not None

    def test_confidence_distribution_chart(self):
        fig = ScarletAnalyzer.confidence_distribution_chart(make_history_records())
        assert fig is not None

    def test_detection_type_pie(self):
        fig = ScarletAnalyzer.detection_type_pie(make_history_records())
        assert fig is not None

    def test_risk_distribution_chart(self):
        fig = ScarletAnalyzer.risk_distribution_chart(make_history_records())
        assert fig is not None

    def test_timeline_chart(self):
        fig = ScarletAnalyzer.timeline_chart(make_history_records())
        assert fig is not None

    def test_empty_data_handling(self):
        fig = ScarletAnalyzer.detection_summary_chart([])
        assert fig is not None

    def test_video_frame_chart(self):
        from src.detection.detector import DetectionResult
        frame_results = [
            DetectionResult(
                boxes=[], confidences=[], class_ids=[], class_names=[],
                fire_count=0, smoke_count=0, default_count=0,
                total_detections=0, max_confidence=0.0, avg_confidence=0.0
            ) for _ in range(5)
        ]
        fig = ScarletAnalyzer.video_frame_chart(frame_results)
        assert fig is not None
