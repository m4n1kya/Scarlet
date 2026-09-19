import sqlite3
from pathlib import Path
from datetime import datetime
from typing import List, Dict, Any, Optional
from contextlib import closing
from src.config import ScarletConfig, get_project_root

class DetectionHistory:
    def __init__(self, db_path: Optional[str] = None):
        if db_path is None:
            config = ScarletConfig()
            self.db_path = get_project_root() / config.history_db
        else:
            self.db_path = Path(db_path)
            
        self.db_path.parent.mkdir(parents=True, exist_ok=True)
        self._init_db()
        
    def _get_conn(self):
        return sqlite3.connect(str(self.db_path), check_same_thread=False)

    def _init_db(self) -> None:
        with closing(self._get_conn()) as conn:
            with conn:
                conn.execute('''
                    CREATE TABLE IF NOT EXISTS detection_history (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        timestamp TEXT,
                        filename TEXT,
                        media_type TEXT,
                        fire_count INTEGER,
                        smoke_count INTEGER,
                        default_count INTEGER,
                        total_detections INTEGER,
                        max_confidence REAL,
                        avg_confidence REAL,
                        risk_level TEXT
                    )
                ''')

    def save(self, filename: str, media_type: str, fire_count: int, smoke_count: int, 
             default_count: int, total_detections: int, max_confidence: float, 
             avg_confidence: float, risk_level: str) -> int:
        timestamp = datetime.now().isoformat()
        with closing(self._get_conn()) as conn:
            with conn:
                cursor = conn.cursor()
                cursor.execute('''
                    INSERT INTO detection_history 
                    (timestamp, filename, media_type, fire_count, smoke_count, default_count, 
                     total_detections, max_confidence, avg_confidence, risk_level)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                ''', (timestamp, filename, media_type, fire_count, smoke_count, default_count, 
                      total_detections, max_confidence, avg_confidence, risk_level))
                return cursor.lastrowid

    def get_all(self) -> List[Dict[str, Any]]:
        with closing(self._get_conn()) as conn:
            conn.row_factory = sqlite3.Row
            cursor = conn.execute('SELECT * FROM detection_history ORDER BY timestamp DESC')
            return [dict(row) for row in cursor.fetchall()]

    def get_recent(self, limit: int = 10) -> List[Dict[str, Any]]:
        with closing(self._get_conn()) as conn:
            conn.row_factory = sqlite3.Row
            cursor = conn.execute('SELECT * FROM detection_history ORDER BY timestamp DESC LIMIT ?', (limit,))
            return [dict(row) for row in cursor.fetchall()]

    def get_stats(self) -> Dict[str, Any]:
        with closing(self._get_conn()) as conn:
            cursor = conn.execute('''
                SELECT 
                    COUNT(*) as total_analyses,
                    SUM(fire_count) as total_fire,
                    SUM(smoke_count) as total_smoke,
                    AVG(avg_confidence) as avg_confidence
                FROM detection_history
            ''')
            row = cursor.fetchone()
            return {
                'total_analyses': row[0] or 0,
                'total_fire': row[1] or 0,
                'total_smoke': row[2] or 0,
                'avg_confidence': row[3] or 0.0
            }

    def clear(self) -> None:
        with closing(self._get_conn()) as conn:
            with conn:
                conn.execute('DELETE FROM detection_history')

    def delete(self, record_id: int) -> None:
        with closing(self._get_conn()) as conn:
            with conn:
                conn.execute('DELETE FROM detection_history WHERE id = ?', (record_id,))
