import os
import io
import cv2
import base64
import numpy as np
from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel

from src.config import get_config
from src.detection.detector import ScarletDetector
from src.detection.processor import ImageProcessor
from src.risk.heuristic import ScarletRiskHeuristic
from src.storage.history import DetectionHistory

app = FastAPI(title="SCARLET API", version="1.0.0")

# Enable CORS for the Vercel frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # For production, restrict this to your Vercel URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global instances
detector = ScarletDetector(get_config())
detector.load_model()
history_db = DetectionHistory()

class DetectResponse(BaseModel):
    fire_count: int
    smoke_count: int
    default_count: int
    total_detections: int
    max_confidence: float
    avg_confidence: float
    risk_level: str
    risk_description: str
    annotated_image_base64: str

@app.get("/")
def read_root():
    return {"message": "SCARLET Detection API is running.", "status": "ok"}

@app.get("/api/system-info")
def get_system_info():
    info = detector.get_model_info()
    return {
        "device": info["device"],
        "model_loaded": info["loaded"],
        "classes": info["classes"]
    }

@app.post("/api/detect/image", response_model=DetectResponse)
async def detect_image(
    file: UploadFile = File(None),
    image_base64: str = Form(None),
    confidence: float = Form(0.25),
    iou: float = Form(0.45)
):
    try:
        if file:
            contents = await file.read()
            if not ImageProcessor.validate_image(contents):
                raise HTTPException(status_code=400, detail="Invalid image file")
            image = ImageProcessor.load_image(contents)
            filename = file.filename
        elif image_base64:
            # Handle base64 from webcam
            header, encoded = image_base64.split(",", 1) if "," in image_base64 else ("", image_base64)
            decoded = base64.b64decode(encoded)
            image = ImageProcessor.load_image(decoded)
            filename = "webcam_snapshot.jpg"
        else:
            raise HTTPException(status_code=400, detail="Must provide file or image_base64")

        # Run detection
        result = detector.detect(image, confidence=confidence, iou=iou)
        annotated = ImageProcessor.draw_detections(image, result)
        
        # Risk heuristic
        risk = ScarletRiskHeuristic.assess_image(result)
        
        # Save to history
        history_db.save(
            filename=filename,
            media_type="image",
            fire_count=result.fire_count,
            smoke_count=result.smoke_count,
            default_count=result.default_count,
            total_detections=result.total_detections,
            max_confidence=result.max_confidence,
            avg_confidence=result.avg_confidence,
            risk_level=risk.value
        )
        
        # Encode output image
        _, buffer = cv2.imencode('.jpg', annotated)
        encoded_img = base64.b64encode(buffer).decode('utf-8')
        
        return {
            "fire_count": result.fire_count,
            "smoke_count": result.smoke_count,
            "default_count": result.default_count,
            "total_detections": result.total_detections,
            "max_confidence": result.max_confidence,
            "avg_confidence": result.avg_confidence,
            "risk_level": risk.value,
            "risk_description": ScarletRiskHeuristic.get_risk_description(risk),
            "annotated_image_base64": f"data:image/jpeg;base64,{encoded_img}"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/history")
def get_history(limit: int = 100):
    records = history_db.get_recent(limit)
    return {"records": records}

@app.get("/api/analytics")
def get_analytics():
    stats = history_db.get_stats()
    records = history_db.get_all()
    
    # Pre-process data for recharts frontend
    timeline = []
    risk_dist = {"LOW": 0, "MODERATE": 0, "HIGH": 0, "CRITICAL": 0}
    
    for r in records:
        ts = r.get("timestamp", "")
        if ts:
            # simple grouping by date for timeline
            date = ts.split("T")[0]
            # Just push all records, let frontend aggregate
            timeline.append({
                "date": date,
                "timestamp": ts,
                "detections": r.get("total_detections", 0),
                "fire": r.get("fire_count", 0),
                "smoke": r.get("smoke_count", 0)
            })
            
        risk = r.get("risk_level", "LOW")
        if risk in risk_dist:
            risk_dist[risk] += 1
            
    return {
        "stats": stats,
        "timeline": timeline,
        "risk_distribution": [{"name": k, "value": v} for k, v in risk_dist.items()]
    }

@app.delete("/api/history")
def clear_history():
    history_db.clear()
    return {"status": "cleared"}
