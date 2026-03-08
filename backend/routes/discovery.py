from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session
from typing import Dict, Any

from models.database import get_db
from models.models import Vendor
from routes.auth import get_current_user
from workers.vendor_discovery import discover_vendors_task

router = APIRouter()

@router.post("/trigger")
def trigger_vendor_discovery(
    background_tasks: BackgroundTasks, 
    db: Session = Depends(get_db), 
    current_user = Depends(get_current_user)
):
    """
    Manually triggers the Vendor Discovery Engine via Celery.
    Returns tracking task acceptance.
    """
    # Trigger background celery task
    task = discover_vendors_task.delay()
    
    return {
        "message": "Vendor Discovery Engine started.",
        "task_id": task.id
    }

@router.get("/stats")
def get_discovery_stats(db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    """
    Returns analytics for the Discovery Dashboard.
    """
    total_vendors = db.query(Vendor).count()
    manually_added = db.query(Vendor).filter(Vendor.discovery_source == "manual").count()
    auto_discovered = db.query(Vendor).filter(Vendor.discovery_source != "manual").count()
    
    return {
        "total_vendors": total_vendors,
        "manually_added": manually_added,
        "auto_discovered": auto_discovered,
        "efficiency_ratio": round(auto_discovered / total_vendors * 100, 2) if total_vendors > 0 else 0.0
    }
