"""SCARLET Configuration Module.

Centralised configuration for model paths, thresholds, device selection,
and output directories.  All paths are relative to the project root and
resolved at runtime — no machine-specific absolute paths are stored.
"""

import os
from pathlib import Path
from dataclasses import dataclass


@dataclass
class ScarletConfig:
    """Application-wide configuration."""

    model_path: str = "models/best.pt"
    confidence_threshold: float = 0.25
    iou_threshold: float = 0.45
    output_dir: str = "outputs"
    history_db: str = "outputs/scarlet_history.db"
    device: str = "auto"
    max_det: int = 300
    imgsz: int = 640


def get_project_root() -> Path:
    """Walk up from this file to find the project root (directory containing app.py)."""
    current = Path(__file__).resolve().parent
    while current != current.parent:
        if (current / "app.py").exists():
            return current
        current = current.parent
    # Fallback: assume src/ is one level below root
    return Path(__file__).resolve().parent.parent


def get_config() -> ScarletConfig:
    """Return a ScarletConfig instance (optionally reading env overrides)."""
    return ScarletConfig(
        confidence_threshold=float(os.getenv("SCARLET_CONFIDENCE", "0.25")),
        iou_threshold=float(os.getenv("SCARLET_IOU", "0.45")),
        device=os.getenv("SCARLET_DEVICE", "auto"),
        output_dir=os.getenv("SCARLET_OUTPUT_DIR", "outputs"),
    )


def get_device() -> str:
    """Return 'cuda' if a CUDA GPU is available, otherwise 'cpu'."""
    try:
        import torch
        return "cuda" if torch.cuda.is_available() else "cpu"
    except ImportError:
        return "cpu"
