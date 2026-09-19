# 🔥 SCARLET

**AI-Powered Wildfire Detection & Monitoring Platform**

[![Python 3.12](https://img.shields.io/badge/Python-3.12-blue.svg)](https://www.python.org/downloads/)
[![YOLOv8](https://img.shields.io/badge/YOLOv8-Ultralytics-purple.svg)](https://github.com/ultralytics/ultralytics)
[![Streamlit](https://img.shields.io/badge/Streamlit-Dashboard-red.svg)](https://streamlit.io/)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

SCARLET is a computer vision platform for detecting fire and smoke in images and video, analyzing detection confidence, tracking detection events, and presenting wildfire-monitoring information through a local Streamlit dashboard.

---

## Overview

SCARLET wraps a YOLOv8s object detection model — trained on the [fire-wrpgm v8](https://universe.roboflow.com/custom-thxhn/fire-wrpgm/dataset/8) dataset — in a modular Python application with a professional monitoring dashboard. The platform processes images, videos, and webcam snapshots to identify fire and smoke, provides a transparent risk heuristic, maintains local detection history via SQLite, and offers analytics and export capabilities.

**Key distinction:** SCARLET is a detection-and-monitoring interface, not a predictive model. It detects fire/smoke in provided media using an inherited pretrained model. It does not predict future wildfire occurrence.

## Features

- **Image Detection** — Upload images for fire/smoke detection with bounding boxes, confidence scores, and class labels
- **Video Detection** — Frame-by-frame video processing with aggregate statistics
- **Webcam Snapshot** — Capture and analyze webcam frames directly in the browser
- **Risk Heuristic** — Transparent, documented risk assessment (LOW / MODERATE / HIGH / CRITICAL)
- **Detection History** — SQLite-backed local history of all analyses
- **Analytics Dashboard** — Interactive Plotly charts showing detection trends, confidence distributions, and risk breakdowns
- **Export** — Download processed images, detection reports (JSON), and history (CSV)
- **GPU Acceleration** — Automatic CUDA detection with CPU fallback
- **Offline Operation** — Runs entirely locally after initial setup

## System Architecture

```
SCARLET/
├── app.py                    # Streamlit dashboard entry point
├── src/
│   ├── config.py             # Configuration management
│   ├── detection/
│   │   ├── detector.py       # YOLOv8 detection engine
│   │   └── processor.py      # Image/video processing pipeline
│   ├── risk/
│   │   └── heuristic.py      # Risk level assessment
│   ├── storage/
│   │   └── history.py        # SQLite detection history
│   ├── analytics/
│   │   └── analyzer.py       # Plotly chart generation
│   └── utils/
│       └── export.py         # Export utilities (CSV, JSON, images)
├── models/
│   └── best.pt               # YOLOv8s trained weights (inherited)
├── data/
│   └── data.yaml             # Dataset class configuration
├── notebooks/
│   └── *.ipynb               # Original training notebook (reference)
├── tests/                    # Pytest test suite
├── outputs/                  # Generated outputs & history DB
└── assets/
    └── sample_images/        # Sample test images
```

## Technology Stack

| Component | Technology |
|---|---|
| Detection Model | YOLOv8s (Ultralytics) |
| Deep Learning Framework | PyTorch (CUDA 12.x) |
| Frontend | Streamlit |
| Image Processing | OpenCV, Pillow |
| Analytics | Plotly |
| Storage | SQLite3 |
| Language | Python 3.12 |

## Requirements

### Hardware
- **GPU (recommended):** NVIDIA GPU with CUDA support (tested on RTX 3060)
- **CPU:** Any modern x86-64 processor (slower inference)
- **RAM:** 4 GB minimum, 8 GB recommended
- **Disk:** ~200 MB for model weights and dependencies

### Software
- Python 3.12
- pip
- Git
- NVIDIA CUDA Toolkit 12.x (for GPU acceleration)
- NVIDIA cuDNN (for GPU acceleration)

## Installation

### Windows Setup

```bash
# Clone the repository
git clone https://github.com/m4n1kya/Scarlet.git
cd Scarlet

# Create virtual environment with Python 3.12
py -3.12 -m venv .venv

# Activate the virtual environment
.venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt
```

### GPU Setup (NVIDIA)

For GPU acceleration, install PyTorch with CUDA support:

```bash
pip install torch torchvision --index-url https://download.pytorch.org/whl/cu124
```

Verify GPU detection:
```python
import torch
print(torch.cuda.is_available())       # Should print True
print(torch.cuda.get_device_name(0))   # Should print your GPU name
```

## Running SCARLET

```bash
# Activate virtual environment
.venv\Scripts\activate

# Launch the dashboard
streamlit run app.py
```

The dashboard will open at `http://localhost:8501`.

### Image Detection
1. Navigate to **Detection** → **Image Detection**
2. Upload a JPG/PNG image
3. View detections with bounding boxes, confidence scores, and risk level
4. Export processed image or JSON report

### Video Detection
1. Navigate to **Detection** → **Video Detection**
2. Upload an MP4/AVI video
3. Monitor frame-by-frame processing progress
4. View aggregate statistics and per-frame detection chart
5. Download processed video

### Webcam Detection
1. Navigate to **Detection** → **Webcam Snapshot**
2. Allow camera access in your browser
3. Capture a snapshot
4. View detection results

## Detection Analytics

The **Analytics** page provides:
- Detection count summaries (fire vs. smoke)
- Confidence distribution histograms
- Detection type proportions
- Risk level distribution
- Detection timeline

## Risk Heuristic

The **SCARLET Detection Risk Heuristic** assigns risk levels based on observable detection data. This is a transparent, rule-based heuristic — not a scientifically validated prediction model.

| Level | Image Criteria | Video Criteria |
|---|---|---|
| LOW | No detections or all below 0.15 confidence | No frames with detections |
| MODERATE | ≤3 detections with <0.5 max confidence, or smoke-only | <20% of frames have detections |
| HIGH | Fire detected with ≥0.5 confidence, or >3 total detections | ≥20% of frames with fire or high confidence |
| CRITICAL | ≥5 fire detections with ≥0.6 avg confidence | ≥50% of frames with fire (avg conf ≥0.5) |

## Detection History

All analyses are stored locally in an SQLite database (`outputs/scarlet_history.db`). The **History** page displays past analyses and allows CSV export.

## Exporting Results

- **Processed Image:** Download annotated images with bounding boxes
- **JSON Report:** Download detection details (counts, confidences, risk level)
- **CSV History:** Export full detection history

## Project Structure

| Directory | Purpose |
|---|---|
| `src/detection/` | Core YOLOv8 detection engine and image/video processing |
| `src/risk/` | Risk heuristic assessment |
| `src/storage/` | SQLite history storage |
| `src/analytics/` | Plotly chart generation |
| `src/utils/` | Export utilities |
| `models/` | YOLOv8 model weights |
| `data/` | Dataset configuration and training reference data |
| `notebooks/` | Original training notebook (reference) |
| `tests/` | Pytest test suite |
| `outputs/` | Generated detection outputs and history database |
| `assets/` | Sample images for testing |

## Testing

```bash
.venv\Scripts\python -m pytest tests/ -v
```

## Model Information

| Property | Value |
|---|---|
| Architecture | YOLOv8s (small) |
| Framework | Ultralytics 8.0.20 |
| Classes | Fire, default, smoke |
| Training epochs | 25 |
| Image size | 800×800 |
| Batch size | 16 |
| Optimizer | SGD |
| Pretrained backbone | No (trained from scratch on `yolov8s.yaml`) |

**Important:** The model weights (`models/best.pt`) are inherited from the source project. They were not trained by the SCARLET author.

## Dataset Information

| Property | Value |
|---|---|
| Name | fire-wrpgm v8 |
| Source | [Roboflow Universe](https://universe.roboflow.com/custom-thxhn/fire-wrpgm/dataset/8) |
| License | CC BY 4.0 |
| Total images | 979 |
| Train split | 877 |
| Validation split | 47 |
| Test split | 55 |
| Classes | Fire, default, smoke |

## Limitations

- **Not a prediction system:** SCARLET detects fire/smoke in provided media. It does not predict future wildfire occurrence.
- **Model accuracy:** The inherited model was trained on 979 images with 25 epochs. It may not generalize to all fire/smoke scenarios.
- **`default` class:** The dataset includes a `default` class that represents unlabeled/ambiguous detections from the original Roboflow dataset.
- **Video processing speed:** Real-time video processing depends on GPU availability. CPU processing is significantly slower.
- **Webcam:** Streamlit webcam support is limited to snapshot capture, not continuous streaming.

## Attribution & Licenses

### SCARLET Application
- **License:** MIT
- **Author:** Manikya N. ([GitHub](https://github.com/m4n1kya))

### Inherited Components

| Component | Source | License |
|---|---|---|
| Training notebook & weights | [Yug-doshi/Fire-and-Smoke-Detection-main](https://github.com/Yug-doshi/Fire-and-Smoke-Detection-main) | — |
| Dataset (fire-wrpgm v8) | [Roboflow Universe](https://universe.roboflow.com/custom-thxhn/fire-wrpgm/dataset/8) | CC BY 4.0 |
| YOLOv8 architecture | [Ultralytics](https://github.com/ultralytics/ultralytics) | AGPL-3.0 |

### What SCARLET Adds

SCARLET is a substantial engineering project built around the inherited detection model:
- Complete Streamlit dashboard application
- Modular Python package architecture
- Image, video, and webcam processing pipeline
- Risk heuristic system
- SQLite detection history
- Analytics and visualization
- Export system
- Comprehensive test suite
- Professional documentation

## Future Improvements

- [ ] Fine-tune model on additional fire/smoke datasets
- [ ] Add real-time video streaming support
- [ ] Implement multi-camera monitoring
- [ ] Add geolocation tagging for detections
- [ ] Create REST API for headless deployment
- [ ] Add notification system for critical-risk detections
- [ ] Support ONNX/TensorRT model optimization

## Author

**Manikya N.**
- GitHub: [m4n1kya](https://github.com/m4n1kya)
