"""SCARLET — AI-Powered Wildfire Detection & Monitoring Platform.

Streamlit dashboard entry-point.  Launch with:
    streamlit run app.py

Author: Manikya N.  •  https://github.com/m4n1kya
"""

import streamlit as st
import cv2
import numpy as np
import tempfile
import os
import sys
from pathlib import Path
from datetime import datetime

from src.config import get_config, get_device, get_project_root
from src.detection.detector import ScarletDetector, DetectionResult
from src.detection.processor import ImageProcessor, VideoProcessor
from src.risk.heuristic import ScarletRiskHeuristic, RiskLevel
from src.storage.history import DetectionHistory
from src.analytics.analyzer import ScarletAnalyzer
from src.utils.export import ExportManager

# ── Page Configuration ──────────────────────────────────────────────────────
st.set_page_config(
    page_title="SCARLET",
    page_icon="🔥",
    layout="wide",
    initial_sidebar_state="expanded",
)

# ── Custom CSS ──────────────────────────────────────────────────────────────
st.markdown("""
<style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');

    html, body, [class*="css"] {
        font-family: 'Inter', sans-serif;
    }

    .stApp {
        background-color: #0a0a0a;
        color: #e0e0e0;
    }

    [data-testid="stSidebar"] {
        background-color: #111111;
        border-right: 1px solid #2a2a2a;
    }

    /* ── Buttons ── */
    .stButton>button {
        background-color: #1a1a1a;
        color: #ffffff;
        border: 1px solid #333;
        border-radius: 6px;
        transition: all 0.25s ease;
    }
    .stButton>button:hover {
        border-color: #DC143C;
        color: #DC143C;
        box-shadow: 0 0 12px rgba(220,20,60,0.2);
    }

    /* ── Progress bar ── */
    .stProgress > div > div > div > div {
        background-color: #DC143C;
    }

    /* ── Metric cards ── */
    div[data-testid="metric-container"] {
        background-color: #141414;
        border: 1px solid #2a2a2a;
        padding: 14px 18px;
        border-radius: 10px;
        transition: transform 0.2s ease, box-shadow 0.2s ease;
    }
    div[data-testid="metric-container"]:hover {
        transform: translateY(-2px);
        box-shadow: 0 6px 16px rgba(220,20,60,0.12);
        border-color: #444;
    }
    div[data-testid="metric-container"] label { color: #999; font-weight: 500; }
    div[data-testid="metric-container"] [data-testid="stMetricValue"] { color: #fff; }

    /* ── Headings ── */
    h1 {
        font-weight: 700;
        letter-spacing: -0.5px;
        padding-bottom: 8px;
        margin-bottom: 16px;
        border-bottom: 3px solid;
        border-image: linear-gradient(90deg, #DC143C 0%, #ff6b6b 60%, transparent 100%) 1;
    }
    h2, h3 { color: #f0f0f0; }

    /* ── Risk badge ── */
    .risk-badge {
        display: inline-block;
        padding: 6px 16px;
        border-radius: 20px;
        font-weight: 700;
        font-size: 15px;
        text-transform: uppercase;
        letter-spacing: 1px;
    }

    /* ── Hide chrome ── */
    #MainMenu { visibility: hidden; }
    footer    { visibility: hidden; }

    /* ── Tabs ── */
    .stTabs [data-baseweb="tab-list"] button[aria-selected="true"] {
        color: #DC143C;
        border-bottom-color: #DC143C;
    }

    /* ── Selectbox / inputs ── */
    div[data-baseweb="select"] > div {
        border-color: #333;
        background-color: #1a1a1a;
    }
</style>
""", unsafe_allow_html=True)


# ── Cached resources ────────────────────────────────────────────────────────
@st.cache_resource
def load_detector():
    """Load detector once and cache across reruns."""
    detector = ScarletDetector(get_config())
    success = detector.load_model()
    return detector if success else None


@st.cache_resource
def load_history():
    """Initialise history DB once."""
    try:
        return DetectionHistory()
    except Exception as exc:
        st.error(f"History database error: {exc}")
        return None


# ── Helpers ─────────────────────────────────────────────────────────────────
def risk_badge(level: RiskLevel):
    """Render a coloured risk-level badge."""
    st.markdown(
        f'<span class="risk-badge" style="background:{level.color}22;'
        f'color:{level.color};border:1px solid {level.color};">'
        f'{level.value} RISK</span>',
        unsafe_allow_html=True,
    )


def show_detection_metrics(result: DetectionResult):
    """Render the standard five-column metrics row."""
    c1, c2, c3, c4, c5 = st.columns(5)
    c1.metric("🔥 Fire", result.fire_count)
    c2.metric("💨 Smoke", result.smoke_count)
    c3.metric("📊 Total", result.total_detections)
    c4.metric("🎯 Max Conf", f"{result.max_confidence:.2f}")
    c5.metric("📈 Avg Conf", f"{result.avg_confidence:.2f}")


# ── Pages ───────────────────────────────────────────────────────────────────
def page_detection(detector: ScarletDetector, history, conf: float, iou: float):
    st.title("Detection Dashboard")

    if detector is None:
        st.error("⚠ Model could not be loaded. Check that `models/best.pt` exists.")
        return

    tab_img, tab_vid, tab_cam = st.tabs(
        ["📷 Image Detection", "🎞 Video Detection", "📸 Webcam Snapshot"]
    )

    # ── Image Detection ─────────────────────────────────────────────────────
    with tab_img:
        uploaded = st.file_uploader(
            "Upload an image", type=["jpg", "jpeg", "png", "bmp", "webp"], key="img_up"
        )
        if uploaded is not None:
            raw_bytes = uploaded.read()
            if not ImageProcessor.validate_image(raw_bytes):
                st.error("Invalid or corrupt image file.")
                return

            image = ImageProcessor.load_image(raw_bytes)
            result = detector.detect(image, confidence=conf, iou=iou)
            annotated = ImageProcessor.draw_detections(image, result)

            col1, col2 = st.columns(2)
            with col1:
                st.image(cv2.cvtColor(image, cv2.COLOR_BGR2RGB), caption="Original", use_container_width=True)
            with col2:
                st.image(cv2.cvtColor(annotated, cv2.COLOR_BGR2RGB), caption="Detections", use_container_width=True)

            show_detection_metrics(result)

            risk = ScarletRiskHeuristic.assess_image(result)
            st.markdown("#### Risk Assessment")
            risk_badge(risk)
            st.caption(ScarletRiskHeuristic.get_risk_description(risk))

            # Detection details expander
            with st.expander("Detection Details"):
                if result.total_detections > 0:
                    rows = []
                    for i in range(result.total_detections):
                        rows.append({
                            "Class": result.class_names[i],
                            "Confidence": f"{result.confidences[i]:.3f}",
                            "Box (x1 y1 x2 y2)": ", ".join(f"{v:.0f}" for v in result.boxes[i]),
                        })
                    st.table(rows)
                else:
                    st.info("No detections in this image.")

            # Action buttons
            a1, a2, a3 = st.columns(3)
            with a1:
                if st.button("💾 Save to History", key="img_save"):
                    if history:
                        history.save(
                            filename=uploaded.name,
                            media_type="image",
                            fire_count=result.fire_count,
                            smoke_count=result.smoke_count,
                            default_count=result.default_count,
                            total_detections=result.total_detections,
                            max_confidence=result.max_confidence,
                            avg_confidence=result.avg_confidence,
                            risk_level=risk.value,
                        )
                        st.success("Saved!")
            with a2:
                img_bytes = ExportManager.get_image_bytes(annotated)
                st.download_button(
                    "⬇ Download Image",
                    data=img_bytes,
                    file_name=f"scarlet_{uploaded.name}",
                    mime="image/png",
                )
            with a3:
                json_str = ExportManager.result_to_json(uploaded.name, "image", result, risk.value)
                st.download_button(
                    "📄 Download JSON",
                    data=json_str,
                    file_name=f"scarlet_{Path(uploaded.name).stem}.json",
                    mime="application/json",
                )

    # ── Video Detection ─────────────────────────────────────────────────────
    with tab_vid:
        uploaded_vid = st.file_uploader(
            "Upload a video", type=["mp4", "avi", "mov", "mkv"], key="vid_up"
        )
        if uploaded_vid is not None:
            if st.button("▶ Process Video", key="vid_proc"):
                suffix = Path(uploaded_vid.name).suffix
                with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp_in:
                    tmp_in.write(uploaded_vid.read())
                    tmp_in_path = tmp_in.name

                out_dir = get_project_root() / "outputs"
                out_dir.mkdir(exist_ok=True)
                out_path = str(out_dir / f"scarlet_{uploaded_vid.name}")

                progress = st.progress(0, text="Initialising…")

                def _progress(cur, total):
                    if total > 0:
                        progress.progress(
                            min(cur / total, 1.0),
                            text=f"Frame {cur}/{total}",
                        )

                vp = VideoProcessor(detector)
                try:
                    summary = vp.process_video(tmp_in_path, out_path, progress_callback=_progress)
                except Exception as exc:
                    st.error(f"Video processing error: {exc}")
                    os.unlink(tmp_in_path)
                    return

                progress.progress(1.0, text="Complete!")

                # Metrics
                m1, m2, m3, m4, m5 = st.columns(5)
                m1.metric("Frames", summary["total_frames"])
                m2.metric("Detections", summary["frames_with_detections"])
                m3.metric("🔥 Fire", summary["total_fire"])
                m4.metric("💨 Smoke", summary["total_smoke"])
                m5.metric("🎯 Max Conf", f"{summary['max_confidence']:.2f}")

                # Risk
                all_results = summary.get("all_results", [])
                vid_risk = ScarletRiskHeuristic.assess_video(all_results, summary["total_frames"])
                st.markdown("#### Video Risk Assessment")
                risk_badge(vid_risk)
                st.caption(ScarletRiskHeuristic.get_risk_description(vid_risk))

                # Frame chart
                if all_results:
                    st.markdown("#### Detections per Frame")
                    fig = ScarletAnalyzer.video_frame_chart(all_results)
                    st.plotly_chart(fig, use_container_width=True)

                # Actions
                a1, a2 = st.columns(2)
                with a1:
                    if st.button("💾 Save to History", key="vid_save"):
                        if history:
                            history.save(
                                filename=uploaded_vid.name,
                                media_type="video",
                                fire_count=summary["total_fire"],
                                smoke_count=summary["total_smoke"],
                                default_count=summary["total_default"],
                                total_detections=summary["frames_with_detections"],
                                max_confidence=summary["max_confidence"],
                                avg_confidence=summary["avg_confidence"],
                                risk_level=vid_risk.value,
                            )
                            st.success("Saved!")
                with a2:
                    if Path(out_path).exists():
                        vid_bytes = ExportManager.get_video_bytes(out_path)
                        st.download_button(
                            "⬇ Download Video",
                            data=vid_bytes,
                            file_name=f"scarlet_{uploaded_vid.name}",
                            mime="video/mp4",
                        )

                os.unlink(tmp_in_path)

    # ── Webcam Snapshot ─────────────────────────────────────────────────────
    with tab_cam:
        cam_img = st.camera_input("Capture a snapshot")
        if cam_img is not None:
            raw = cam_img.read()
            image = ImageProcessor.load_image(raw)
            result = detector.detect(image, confidence=conf, iou=iou)
            annotated = ImageProcessor.draw_detections(image, result)

            st.image(cv2.cvtColor(annotated, cv2.COLOR_BGR2RGB), caption="Detection Result", use_container_width=True)
            show_detection_metrics(result)

            risk = ScarletRiskHeuristic.assess_image(result)
            risk_badge(risk)

            if st.button("💾 Save Snapshot", key="cam_save"):
                if history:
                    history.save(
                        filename=f"webcam_{datetime.now().strftime('%Y%m%d_%H%M%S')}",
                        media_type="webcam",
                        fire_count=result.fire_count,
                        smoke_count=result.smoke_count,
                        default_count=result.default_count,
                        total_detections=result.total_detections,
                        max_confidence=result.max_confidence,
                        avg_confidence=result.avg_confidence,
                        risk_level=risk.value,
                    )
                    st.success("Saved!")


def page_analytics(history):
    st.title("Analytics & Insights")

    if history is None:
        st.warning("History database unavailable.")
        return

    records = history.get_all()
    if not records:
        st.info("No analyses yet. Run some detections first!")
        return

    stats = history.get_stats()
    c1, c2, c3, c4 = st.columns(4)
    c1.metric("Total Analyses", stats["total_analyses"])
    c2.metric("🔥 Total Fire", stats["total_fire"])
    c3.metric("💨 Total Smoke", stats["total_smoke"])
    c4.metric("Avg Confidence", f"{stats['avg_confidence']:.2f}")

    st.markdown("### Detection Summary")
    st.plotly_chart(ScarletAnalyzer.detection_summary_chart(records), use_container_width=True)

    col1, col2 = st.columns(2)
    with col1:
        st.markdown("### Detection Types")
        st.plotly_chart(ScarletAnalyzer.detection_type_pie(records), use_container_width=True)
    with col2:
        st.markdown("### Risk Distribution")
        st.plotly_chart(ScarletAnalyzer.risk_distribution_chart(records), use_container_width=True)

    st.markdown("### Confidence Distribution")
    st.plotly_chart(ScarletAnalyzer.confidence_distribution_chart(records), use_container_width=True)

    st.markdown("### Timeline")
    st.plotly_chart(ScarletAnalyzer.timeline_chart(records), use_container_width=True)


def page_history(history):
    st.title("Detection History")

    if history is None:
        st.warning("History database unavailable.")
        return

    records = history.get_all()
    if not records:
        st.info("History is empty.")
        return

    st.dataframe(records, use_container_width=True)
    st.caption(f"Showing {len(records)} record(s)")

    col1, col2 = st.columns(2)
    with col1:
        csv_data = ExportManager.history_to_csv(records)
        st.download_button("📥 Export CSV", data=csv_data, file_name="scarlet_history.csv", mime="text/csv")
    with col2:
        if st.button("🗑 Clear History", type="primary"):
            history.clear()
            st.success("History cleared.")
            st.rerun()


def page_about():
    st.title("About SCARLET")

    st.markdown("""
**SCARLET** is an AI-powered computer vision platform for detecting fire and smoke
in images and video, analyzing detection confidence, tracking detection events,
and presenting wildfire-monitoring information through a local dashboard.

> **Key distinction:** SCARLET is a detection-and-monitoring interface, not a
> predictive model.  It detects fire/smoke in provided media using an inherited
> pretrained model.  It does not predict future wildfire occurrence.
""")

    st.markdown("### Technology Stack")
    cols = st.columns(4)
    cols[0].markdown("**Model**\n\nYOLOv8s (Ultralytics)")
    cols[1].markdown("**Framework**\n\nPyTorch + CUDA")
    cols[2].markdown("**Frontend**\n\nStreamlit")
    cols[3].markdown("**Analytics**\n\nPlotly + SQLite")

    st.markdown("### Model Information")
    st.markdown("""
| Property | Value |
|---|---|
| Architecture | YOLOv8s (small) |
| Classes | Fire, default, smoke |
| Training epochs | 25 |
| Image size | 800×800 |
| Dataset | [fire-wrpgm v8](https://universe.roboflow.com/custom-thxhn/fire-wrpgm/dataset/8) (CC BY 4.0, 979 images) |

> **Note:** The model weights (`models/best.pt`) are inherited from the
> [source project](https://github.com/Yug-doshi/Fire-and-Smoke-Detection-main).
> They were **not** trained by the SCARLET author.
""")

    st.markdown("### Risk Heuristic")
    st.code(ScarletRiskHeuristic.HEURISTIC_DOC, language="text")

    st.markdown("### Attribution & Licenses")
    st.markdown("""
| Component | Source | License |
|---|---|---|
| SCARLET application | [m4n1kya/Scarlet](https://github.com/m4n1kya/Scarlet) | MIT |
| Training & weights | [Yug-doshi/Fire-and-Smoke-Detection-main](https://github.com/Yug-doshi/Fire-and-Smoke-Detection-main) | — |
| Dataset | [Roboflow fire-wrpgm v8](https://universe.roboflow.com/custom-thxhn/fire-wrpgm/dataset/8) | CC BY 4.0 |
| YOLOv8 | [Ultralytics](https://github.com/ultralytics/ultralytics) | AGPL-3.0 |
""")

    st.markdown("---")
    st.markdown("**Author:** Manikya N.  •  [GitHub](https://github.com/m4n1kya)")


# ── Main ────────────────────────────────────────────────────────────────────
def main():
    # Sidebar
    st.sidebar.markdown("## 🔥 SCARLET")
    st.sidebar.markdown("**AI-Powered Wildfire Detection & Monitoring Platform**")
    st.sidebar.caption("Developer: Manikya N.")
    st.sidebar.markdown("---")

    page = st.sidebar.radio(
        "Navigate",
        ["🔍 Detection", "📊 Analytics", "📋 History", "ℹ️ About"],
    )

    st.sidebar.markdown("---")
    st.sidebar.markdown("### ⚙ Settings")
    conf = st.sidebar.slider("Confidence Threshold", 0.0, 1.0, 0.25, 0.01)
    iou = st.sidebar.slider("IoU Threshold", 0.0, 1.0, 0.45, 0.01)

    st.sidebar.markdown("---")
    st.sidebar.markdown("### 🖥 System")
    device = get_device()
    st.sidebar.text(f"Device : {'🟢 ' + device.upper() if device == 'cuda' else '🔵 CPU'}")

    detector = load_detector()
    st.sidebar.text(f"Model  : {'✅ Loaded' if detector else '❌ Not loaded'}")
    st.sidebar.text(f"Python : {sys.version.split()[0]}")

    history = load_history()

    if page == "🔍 Detection":
        page_detection(detector, history, conf, iou)
    elif page == "📊 Analytics":
        page_analytics(history)
    elif page == "📋 History":
        page_history(history)
    elif page == "ℹ️ About":
        page_about()


if __name__ == "__main__":
    main()
