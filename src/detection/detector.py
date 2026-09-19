"""SCARLET Detection Engine — Core YOLOv8 inference wrapper.

Wraps the Ultralytics YOLOv8 model for fire and smoke detection.
The model weights are inherited from the source project
(https://github.com/Yug-doshi/Fire-and-Smoke-Detection-main).
"""

import logging
import numpy as np
from pathlib import Path
from dataclasses import dataclass, field
from typing import List, Dict, Any, Optional

logger = logging.getLogger(__name__)


@dataclass
class DetectionResult:
    """Container for detection results from a single image/frame."""

    boxes: List[List[float]] = field(default_factory=list)
    confidences: List[float] = field(default_factory=list)
    class_ids: List[int] = field(default_factory=list)
    class_names: List[str] = field(default_factory=list)
    fire_count: int = 0
    smoke_count: int = 0
    default_count: int = 0
    total_detections: int = 0
    max_confidence: float = 0.0
    avg_confidence: float = 0.0


class ScarletDetector:
    """YOLOv8-based fire and smoke detector.

    Loads a trained YOLOv8 model and runs inference on images.
    Classes: 0=Fire, 1=default, 2=smoke (from the fire-wrpgm v8 dataset).
    """

    CLASS_NAMES: Dict[int, str] = {0: "Fire", 1: "default", 2: "smoke"}

    def __init__(self, config=None):
        from src.config import ScarletConfig
        self.config = config or ScarletConfig()
        self.model = None
        self.model_loaded: bool = False
        self.device_info: str = ""

    def load_model(self) -> bool:
        """Load the YOLO model from the configured path.

        Returns:
            True if model loaded successfully, False otherwise.
        """
        from src.config import get_project_root, get_device

        model_path = get_project_root() / self.config.model_path
        if not model_path.exists():
            logger.error("Model file not found: %s", model_path)
            return False

        try:
            from ultralytics import YOLO
            self.model = YOLO(str(model_path))
            # Resolve device
            device = self.config.device
            if device == "auto":
                device = get_device()
            self.device_info = device
            self.model_loaded = True
            logger.info("Model loaded from %s (device=%s)", model_path, device)
            return True
        except Exception as exc:
            logger.error("Failed to load model: %s", exc)
            self.model_loaded = False
            return False

    def detect(
        self,
        image: np.ndarray,
        confidence: Optional[float] = None,
        iou: Optional[float] = None,
    ) -> DetectionResult:
        """Run detection on a single image.

        Args:
            image: BGR image as numpy array.
            confidence: Override confidence threshold.
            iou: Override IoU threshold.

        Returns:
            DetectionResult with parsed detections.

        Raises:
            RuntimeError: If model is not loaded or inference fails.
        """
        if not self.model_loaded or self.model is None:
            raise RuntimeError("Model not loaded. Call load_model() first.")

        conf = confidence if confidence is not None else self.config.confidence_threshold
        iou_thresh = iou if iou is not None else self.config.iou_threshold

        try:
            results = self.model(
                image,
                conf=conf,
                iou=iou_thresh,
                device=self.device_info,
                max_det=self.config.max_det,
                imgsz=self.config.imgsz,
                verbose=False,
            )
            return self._parse_results(results[0])
        except Exception as exc:
            raise RuntimeError(f"Inference error: {exc}") from exc

    def _parse_results(self, result) -> DetectionResult:
        """Parse raw YOLO results into a DetectionResult."""
        boxes: List[List[float]] = []
        confidences: List[float] = []
        class_ids: List[int] = []
        class_names: List[str] = []

        fire_count = 0
        smoke_count = 0
        default_count = 0

        if result.boxes is not None and len(result.boxes) > 0:
            for box in result.boxes:
                b = box.xyxy[0].cpu().numpy().tolist()
                c = float(box.conf[0].cpu().numpy())
                cls_id = int(box.cls[0].cpu().numpy())
                cls_name = self.CLASS_NAMES.get(cls_id, "Unknown")

                boxes.append(b)
                confidences.append(c)
                class_ids.append(cls_id)
                class_names.append(cls_name)

                if cls_name == "Fire":
                    fire_count += 1
                elif cls_name == "smoke":
                    smoke_count += 1
                elif cls_name == "default":
                    default_count += 1

        total = len(boxes)
        max_conf = max(confidences) if confidences else 0.0
        avg_conf = sum(confidences) / total if total > 0 else 0.0

        return DetectionResult(
            boxes=boxes,
            confidences=confidences,
            class_ids=class_ids,
            class_names=class_names,
            fire_count=fire_count,
            smoke_count=smoke_count,
            default_count=default_count,
            total_detections=total,
            max_confidence=max_conf,
            avg_confidence=avg_conf,
        )

    def get_model_info(self) -> Dict[str, Any]:
        """Return model metadata."""
        return {
            "name": "YOLOv8s — SCARLET Fire & Smoke Detector",
            "device": self.device_info,
            "classes": self.CLASS_NAMES,
            "loaded": self.model_loaded,
            "weights": self.config.model_path,
        }
