from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from schemas.notification_schema import NotificationResponse, MarkReadRequest
from models.database import get_db
from models.models import Notification
from routes.auth import get_current_user

router = APIRouter()



@router.get("/", response_model=List[NotificationResponse])
def get_notifications(db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    notifications = db.query(Notification).filter(Notification.user_id == current_user.id).all()
    return notifications

@router.post("/mark-read")
def mark_notifications_read(request: MarkReadRequest, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    notifications = db.query(Notification).filter(
        Notification.id.in_(request.notification_ids),
        Notification.user_id == current_user.id
    ).all()
    for notification in notifications:
        notification.is_read = True
    db.commit()
    return {"message": "Notifications marked as read"}