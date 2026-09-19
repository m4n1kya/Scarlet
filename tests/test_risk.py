"""Tests for SCARLET risk heuristic."""
import pytest
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent))

from src.risk.heuristic import ScarletRiskHeuristic, RiskLevel
from src.detection.detector import DetectionResult


def make_result(fire=0, smoke=0, default=0, max_conf=0.0, avg_conf=0.0):
    """Helper to create DetectionResult for testing."""
    total = fire + smoke + default
    return DetectionResult(
        boxes=[[0, 0, 1, 1]] * total,
        confidences=[max_conf] * total if total > 0 else [],
        class_ids=[0] * fire + [2] * smoke + [1] * default,
        class_names=["Fire"] * fire + ["smoke"] * smoke + ["default"] * default,
        fire_count=fire, smoke_count=smoke, default_count=default,
        total_detections=total,
        max_confidence=max_conf, avg_confidence=avg_conf
    )


class TestRiskLevel:
    """Test RiskLevel enum."""

    def test_risk_levels_exist(self):
        assert RiskLevel.LOW.value == "LOW"
        assert RiskLevel.MODERATE.value == "MODERATE"
        assert RiskLevel.HIGH.value == "HIGH"
        assert RiskLevel.CRITICAL.value == "CRITICAL"

    def test_risk_colors(self):
        assert RiskLevel.LOW.color == "#22c55e"
        assert RiskLevel.CRITICAL.color == "#ef4444"


class TestImageRiskAssessment:
    """Test image risk assessment heuristic."""

    def test_no_detections_is_low(self):
        result = make_result()
        risk = ScarletRiskHeuristic.assess_image(result)
        assert risk == RiskLevel.LOW

    def test_low_confidence_is_low(self):
        result = make_result(fire=1, max_conf=0.10, avg_conf=0.10)
        risk = ScarletRiskHeuristic.assess_image(result)
        assert risk == RiskLevel.LOW

    def test_smoke_only_moderate(self):
        result = make_result(smoke=2, max_conf=0.6, avg_conf=0.5)
        risk = ScarletRiskHeuristic.assess_image(result)
        assert risk == RiskLevel.MODERATE

    def test_fire_high_confidence_is_high(self):
        result = make_result(fire=2, max_conf=0.7, avg_conf=0.6)
        risk = ScarletRiskHeuristic.assess_image(result)
        assert risk == RiskLevel.HIGH

    def test_many_fire_detections_is_critical(self):
        result = make_result(fire=6, max_conf=0.8, avg_conf=0.7)
        risk = ScarletRiskHeuristic.assess_image(result)
        assert risk == RiskLevel.CRITICAL


class TestVideoRiskAssessment:
    """Test video risk assessment heuristic."""

    def test_no_frame_detections_is_low(self):
        frames = [make_result() for _ in range(10)]
        risk = ScarletRiskHeuristic.assess_video(frames, 10)
        assert risk == RiskLevel.LOW

    def test_few_frames_with_smoke_is_moderate(self):
        frames = [make_result() for _ in range(9)]
        frames.append(make_result(smoke=1, max_conf=0.3, avg_conf=0.3))
        risk = ScarletRiskHeuristic.assess_video(frames, 10)
        assert risk in (RiskLevel.LOW, RiskLevel.MODERATE)

    def test_many_frames_with_fire_is_critical(self):
        frames = [make_result(fire=2, max_conf=0.7, avg_conf=0.65) for _ in range(8)]
        frames += [make_result() for _ in range(2)]
        risk = ScarletRiskHeuristic.assess_video(frames, 10)
        assert risk == RiskLevel.CRITICAL


class TestRiskDescription:
    """Test risk description generation."""

    def test_descriptions_exist(self):
        for level in RiskLevel:
            desc = ScarletRiskHeuristic.get_risk_description(level)
            assert isinstance(desc, str)
            assert len(desc) > 0
