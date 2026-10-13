# Changelog

All notable changes to **SCARLET** are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [1.2.0] - 2026-10-02

### Added
- **Normalized Burn Area Estimation:** Added viewport flame coverage calculation (`fire_area_est`) in [`ScarletDetector._parse_results`](src/detection/detector.py) using normalized YOLOv8 bounding-box coordinates (`xyxyn`).
- **Automated Dispatch Directives:** Implemented real-time translation of heuristic hazard levels into actionable operational statuses (`NO FIRE DETECTED`, `INVESTIGATE`, `DEPLOY UNITS`, `EVACUATE`).
- **Telemetry Performance Metrics:** Exposed end-to-end frame inference latency (`inference_time_ms`) and compute device metadata (`cuda` / `cpu`) in the `/api/detect/image` payload.
- **DevOps & Containerization:** Added `pyproject.toml`, `docker-compose.yml`, `Makefile`, and GitHub Actions CI workflow (`.github/workflows/ci.yml`).

### Changed
- **Telemetry Dashboard Grid:** Replaced generic ML metrics in the live telemetry panel with domain-specific emergency response indicators (Burn Area Est. %, Dispatch Status, Peak Confidence, and Inference Latency).
- **Analytics Data Pipeline:** Upgraded `/api/analytics` aggregation in [`backend_app.py`](backend_app.py) to compute daily confidence averages, class distribution radar metrics, and temporal detection volumes.

### Performance
- **High-Resolution Frame Downscaling:** Added adaptive aspect-ratio-preserving frame resizing (`max_dim = 1280`) prior to OpenCV JPEG encoding and Base64 serialization, reducing round-trip API latency on 4K images by over 75%.

### Fixed
- Resolved Next.js App Router client boundary directive in `frontend/src/app/analytics/page.tsx`.
- Fixed accessibility `alt` attributes and drag-and-drop event handling on the main control center interface.

---

## [1.1.0] - 2026-09-19

### Added
- **Decoupled Full-Stack Architecture:** Introduced a FastAPI REST backend ([`backend_app.py`](backend_app.py)) paired with a Next.js 15 App Router frontend (`frontend/`).
- **Advanced Analytics Suite:** Built interactive multi-chart visualizations using Recharts (Detection Volume Area Chart, Activity vs. Confidence Composed Chart, Class Signature Radar Chart, and Risk Distribution Donut Chart).
- **Live Webcam Inference:** Added browser-native `react-webcam` frame capture and Base64 streaming to `/api/detect/image`.
- **Interactive WebGL Background:** Integrated dynamic shader-driven status visualization (`EvilEye` component) reactive to inference states and detected hazard severity.

---

## [1.0.0] - 2026-09-15

### Added
- **YOLOv8 Detection Engine:** Core [`ScarletDetector`](src/detection/detector.py) wrapper supporting custom-trained YOLOv8 weights (`models/best.pt`) across `Fire`, `smoke`, and `default` classes.
- **Risk Heuristic Engine:** Rule-based [`ScarletRiskHeuristic`](src/risk/heuristic.py) evaluating image and video frame sequences into `LOW`, `MODERATE`, `HIGH`, and `CRITICAL` hazard levels.
- **Persistent SQLite Storage:** Local [`DetectionHistory`](src/storage/history.py) database logger for auditing historical inference runs and aggregate statistics.
- **Automated Test Suite:** Unit and integration tests covering detector initialization, risk classification heuristics, SQLite persistence, and analytics generation (`tests/`).
