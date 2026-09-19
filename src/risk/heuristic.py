from enum import Enum
from typing import List
from src.detection.detector import DetectionResult

class RiskLevel(Enum):
    LOW = 'LOW'
    MODERATE = 'MODERATE'
    HIGH = 'HIGH'
    CRITICAL = 'CRITICAL'

    @property
    def color(self) -> str:
        colors = {
            RiskLevel.LOW: '#22c55e',
            RiskLevel.MODERATE: '#f59e0b',
            RiskLevel.HIGH: '#f97316',
            RiskLevel.CRITICAL: '#ef4444'
        }
        return colors[self]

class ScarletRiskHeuristic:
    HEURISTIC_DOC = """
SCARLET Risk Assessment Heuristic:

Images:
- LOW: total_detections == 0 or max_confidence < 0.15
- CRITICAL: fire_count >= 5 and avg_confidence >= 0.6
- HIGH: fire_count > 0 and max_confidence >= 0.5, or total_detections > 3
- MODERATE: total_detections <= 3 and max_confidence < 0.5, or fire_count == 0 (smoke only)

Videos:
- LOW: no frames with detections
- CRITICAL: >= 50% frames have fire detections with avg confidence >= 0.5
- HIGH: >= 20% frames have fire or high confidence
- MODERATE: < 20% of frames have detections with low avg confidence
"""

    @staticmethod
    def assess_image(result: DetectionResult) -> RiskLevel:
        if result.total_detections == 0 or result.max_confidence < 0.15:
            return RiskLevel.LOW
            
        if result.fire_count >= 5 and result.avg_confidence >= 0.6:
            return RiskLevel.CRITICAL
            
        if (result.fire_count > 0 and result.max_confidence >= 0.5) or result.total_detections > 3:
            return RiskLevel.HIGH
            
        return RiskLevel.MODERATE

    @staticmethod
    def assess_video(frame_results: List[DetectionResult], total_frames: int) -> RiskLevel:
        if total_frames == 0:
            return RiskLevel.LOW
            
        frames_with_det = sum(1 for r in frame_results if r.total_detections > 0)
        frames_with_fire = sum(1 for r in frame_results if r.fire_count > 0)
        
        if frames_with_det == 0:
            return RiskLevel.LOW
            
        fire_avg_confs = [r.avg_confidence for r in frame_results if r.fire_count > 0]
        overall_fire_avg_conf = sum(fire_avg_confs) / len(fire_avg_confs) if fire_avg_confs else 0.0
        
        if (frames_with_fire / total_frames) >= 0.5 and overall_fire_avg_conf >= 0.5:
            return RiskLevel.CRITICAL
            
        if (frames_with_fire / total_frames) >= 0.2:
            return RiskLevel.HIGH
            
        return RiskLevel.MODERATE

    @staticmethod
    def get_risk_description(level: RiskLevel) -> str:
        descriptions = {
            RiskLevel.LOW: "Low risk. Minimal to no indications of wildfire activity.",
            RiskLevel.MODERATE: "Moderate risk. Possible signs of smoke or minor anomalies detected.",
            RiskLevel.HIGH: "High risk. Confirmed presence of fire or significant smoke.",
            RiskLevel.CRITICAL: "Critical risk. Extensive fire detected with high confidence."
        }
        return descriptions.get(level, "Unknown risk level.")
