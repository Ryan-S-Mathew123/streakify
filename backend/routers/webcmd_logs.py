from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from ..database import get_db
from ..models import WebcmdLog

router = APIRouter(prefix="/api/webcmd-logs", tags=["webcmd-logs"])

@router.get("")
def get_webcmd_logs(limit: int = 20, db: Session = Depends(get_db)):
    logs = db.query(WebcmdLog).order_by(WebcmdLog.timestamp.desc()).limit(limit).all()
    result = []
    for l in logs:
        result.append({
            "id": l.id,
            "command": l.command,
            "query": l.query,
            "duration_ms": l.duration_ms,
            "status_code": l.status_code,
            "output_preview": l.output_preview,
            "timestamp": l.timestamp.isoformat()
        })
    return result
