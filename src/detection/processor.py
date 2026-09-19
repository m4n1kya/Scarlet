import cv2
import numpy as np
from pathlib import Path
from typing import Union, Callable, Dict, Any, List
import tempfile
import io

from src.detection.detector import DetectionResult, ScarletDetector

class ImageProcessor:
    @staticmethod
    def load_image(file_path_or_bytes: Union[str, Path, bytes]) -> np.ndarray:
        if isinstance(file_path_or_bytes, bytes):
            nparr = np.frombuffer(file_path_or_bytes, np.uint8)
            img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
            if img is None:
                raise ValueError("Could not decode image bytes")
            return img
        else:
            img = cv2.imread(str(file_path_or_bytes))
            if img is None:
                raise ValueError(f"Could not load image from {file_path_or_bytes}")
            return img

    @staticmethod
    def draw_detections(image: np.ndarray, result: DetectionResult) -> np.ndarray:
        img_out = image.copy()
        
        colors = {
            'Fire': (0, 0, 255),
            'smoke': (128, 128, 128),
            'default': (0, 255, 255)
        }
        
        for box, conf, cls_name in zip(result.boxes, result.confidences, result.class_names):
            x1, y1, x2, y2 = map(int, box)
            color = colors.get(cls_name, (255, 255, 255))
            
            cv2.rectangle(img_out, (x1, y1), (x2, y2), color, 2)
            
            label = f"{cls_name} {conf:.2f}"
            (w, h), _ = cv2.getTextSize(label, cv2.FONT_HERSHEY_SIMPLEX, 0.5, 1)
            
            cv2.rectangle(img_out, (x1, y1 - h - 5), (x1 + w, y1), color, -1)
            cv2.putText(img_out, label, (x1, y1 - 5), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (255, 255, 255), 1)
            
        return img_out

    @staticmethod
    def validate_image(file_bytes: bytes) -> bool:
        try:
            nparr = np.frombuffer(file_bytes, np.uint8)
            img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
            return img is not None
        except:
            return False

class VideoProcessor:
    def __init__(self, detector: ScarletDetector):
        self.detector = detector

    def process_video(self, input_path: str, output_path: str, progress_callback: Callable[[int, int], None] = None) -> Dict[str, Any]:
        cap = cv2.VideoCapture(input_path)
        if not cap.isOpened():
            raise ValueError(f"Could not open video {input_path}")
            
        total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
        fps = int(cap.get(cv2.CAP_PROP_FPS))
        width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
        height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
        
        fourcc = cv2.VideoWriter_fourcc(*'XVID')
        out = cv2.VideoWriter(output_path, fourcc, fps, (width, height))
        
        processed_frames = 0
        frames_with_detections = 0
        total_fire = 0
        total_smoke = 0
        total_default = 0
        all_max_confs = []
        all_results = []
        
        while cap.isOpened():
            ret, frame = cap.read()
            if not ret:
                break
                
            result = self.detector.detect(frame)
            all_results.append(result)
            
            if result.total_detections > 0:
                frames_with_detections += 1
                total_fire += result.fire_count
                total_smoke += result.smoke_count
                total_default += result.default_count
                all_max_confs.append(result.max_confidence)
                
            out_frame = ImageProcessor.draw_detections(frame, result)
            out.write(out_frame)
            
            processed_frames += 1
            if progress_callback:
                progress_callback(processed_frames, total_frames)
                
        cap.release()
        out.release()
        
        return {
            'total_frames': total_frames,
            'processed_frames': processed_frames,
            'frames_with_detections': frames_with_detections,
            'total_fire': total_fire,
            'total_smoke': total_smoke,
            'total_default': total_default,
            'max_confidence': max(all_max_confs) if all_max_confs else 0.0,
            'avg_confidence': sum(all_max_confs) / len(all_max_confs) if all_max_confs else 0.0,
            'all_results': all_results
        }

    @staticmethod
    def validate_video(file_path: str) -> bool:
        cap = cv2.VideoCapture(file_path)
        is_opened = cap.isOpened()
        cap.release()
        return is_opened
