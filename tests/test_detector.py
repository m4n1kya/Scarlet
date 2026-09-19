"""Tests for SCARLET detection engine."""
import pytest
import numpy as np
from pathlib import Path
import sys

sys.path.insert(0, str(Path(__file__).parent.parent))

from src.config import get_config, get_project_root, ScarletConfig
from src.detection.detector import ScarletDetector, DetectionResult


class TestScarletConfig:
    """Test configuration module."""

    def test_default_config(self):
        config = get_config()
        assert config.confidence_threshold == 0.25
        assert config.iou_threshold == 0.45
        assert config.model_path == "models/best.pt"
        assert config.output_dir == "outputs"

    def test_device_config(self):
        config = get_config()
        assert config.device in ("auto", "cuda", "cpu")


class TestDetectionResult:
    """Test DetectionResult dataclass."""

    def test_empty_result(self):
        result = DetectionResult(
            boxes=[], confidences=[], class_ids=[], class_names=[],
            fire_count=0, smoke_count=0, default_count=0,
            total_detections=0, max_confidence=0.0, avg_confidence=0.0
        )
        assert result.total_detections == 0
        assert result.fire_count == 0
        assert result.max_confidence == 0.0

    def test_populated_result(self):
        result = DetectionResult(
            boxes=[[10, 20, 100, 200]], confidences=[0.85],
            class_ids=[0], class_names=["Fire"],
            fire_count=1, smoke_count=0, default_count=0,
            total_detections=1, max_confidence=0.85, avg_confidence=0.85
        )
        assert result.total_detections == 1
        assert result.fire_count == 1
        assert result.class_names[0] == "Fire"


class TestScarletDetector:
    """Test detector initialization and model loading."""

    def test_detector_init(self):
        detector = ScarletDetector()
        assert detector.model is None
        assert detector.model_loaded is False

    def test_detector_with_custom_config(self):
        config = ScarletConfig(confidence_threshold=0.5, iou_threshold=0.6)
        detector = ScarletDetector(config=config)
        assert detector.config.confidence_threshold == 0.5

    def test_model_loading(self):
        """Test model loads successfully if weights exist."""
        detector = ScarletDetector()
        root = get_project_root()
        model_path = root / "models" / "best.pt"
        if model_path.exists():
            success = detector.load_model()
            assert success is True
            assert detector.model_loaded is True
            assert detector.model is not None

    def test_model_loading_missing_file(self):
        """Test model loading fails gracefully for missing weights."""
        config = ScarletConfig(model_path="nonexistent/model.pt")
        detector = ScarletDetector(config=config)
        success = detector.load_model()
        assert success is False
        assert detector.model_loaded is False

    def test_detection_on_sample_image(self):
        """Test detection on a sample image if model and sample exist."""
        detector = ScarletDetector()
        root = get_project_root()
        model_path = root / "models" / "best.pt"
        sample_path = root / "assets" / "sample_images" / "sample_fire.jpg"
        if model_path.exists() and sample_path.exists():
            detector.load_model()
            import cv2
            image = cv2.imread(str(sample_path))
            if image is not None:
                result = detector.detect(image)
                assert isinstance(result, DetectionResult)
                assert isinstance(result.total_detections, int)
                assert isinstance(result.max_confidence, float)
                assert result.fire_count >= 0
                assert result.smoke_count >= 0
