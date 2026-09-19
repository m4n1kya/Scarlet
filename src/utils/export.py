import csv
import json
import io
from datetime import datetime
import numpy as np
import cv2
from pathlib import Path

from src.detection.detector import DetectionResult

class ExportManager:
    @staticmethod
    def history_to_csv(history: list[dict]) -> str:
        if not history:
            return ""
        
        output = io.StringIO()
        keys = history[0].keys()
        writer = csv.DictWriter(output, fieldnames=keys)
        writer.writeheader()
        writer.writerows(history)
        
        return output.getvalue()

    @staticmethod
    def result_to_json(filename: str, media_type: str, result: DetectionResult, risk_level: str) -> str:
        data = {
            "timestamp": datetime.now().isoformat(),
            "filename": filename,
            "media_type": media_type,
            "detections": {
                "fire_count": result.fire_count,
                "smoke_count": result.smoke_count,
                "default_count": result.default_count,
                "total_detections": result.total_detections,
                "max_confidence": result.max_confidence,
                "avg_confidence": result.avg_confidence
            },
            "risk_level": risk_level
        }
        return json.dumps(data, indent=2)

    @staticmethod
    def save_processed_image(image: np.ndarray, output_path: str) -> str:
        path = Path(output_path)
        path.parent.mkdir(parents=True, exist_ok=True)
        cv2.imwrite(str(path), image)
        return str(path)

    @staticmethod
    def get_image_bytes(image: np.ndarray) -> bytes:
        is_success, buffer = cv2.imencode(".png", image)
        if not is_success:
            raise RuntimeError("Failed to encode image to bytes")
        return buffer.tobytes()

    @staticmethod
    def get_video_bytes(video_path: str) -> bytes:
        path = Path(video_path)
        if not path.exists():
            raise FileNotFoundError(f"Video not found at {video_path}")
        return path.read_bytes()
