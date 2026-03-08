from pydantic import BaseModel
from typing import List

class NotificationResponse(BaseModel):
    id: int
    message: str
    is_read: bool

    model_config = {
        "from_attributes": True
    }

class MarkReadRequest(BaseModel):
    notification_ids: List[int]
