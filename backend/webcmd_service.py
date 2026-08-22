import subprocess
import time
import json
import os
from sqlalchemy.orm import Session
from .models import WebcmdLog

def run_webcmd_spotify_search(query: str, db: Session = None, limit: int = 10):
    start_time = time.time()
    cmd = f'webcmd webcmd-plugin-spotify search "{query}" --limit {limit} -f json'
    
    status_code = 0
    raw_output = ""
    results = []

    try:
        # Execute webcmd CLI subprocess
        process = subprocess.run(
            cmd,
            shell=True,
            capture_output=True,
            text=True,
            timeout=15
        )
        status_code = process.returncode
        raw_output = process.stdout if process.returncode == 0 else process.stderr
        
        if process.returncode == 0 and raw_output.strip():
            try:
                results = json.loads(raw_output)
            except json.JSONDecodeError:
                results = []
    except Exception as e:
        status_code = 500
        raw_output = f"WebCMD Subprocess Error: {str(e)}"
        results = []

    duration_ms = int((time.time() - start_time) * 1000)

    # Log to WebcmdLog for live observability in the UI
    if db is not None:
        try:
            log_entry = WebcmdLog(
                command=cmd,
                query=query,
                duration_ms=duration_ms,
                status_code=status_code,
                output_preview=raw_output[:1000] if raw_output else "[]",
            )
            db.add(log_entry)
            db.commit()
        except Exception as log_err:
            print("Failed to save WebcmdLog:", log_err)

    return {
        "command": cmd,
        "duration_ms": duration_ms,
        "status_code": status_code,
        "results_count": len(results),
        "results": results
    }
