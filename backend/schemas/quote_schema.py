from pydantic import BaseModel, Field
from typing import Optional

class QuoteBase(BaseModel):
    vendor_id: int
    order_id: int
    quoted_price: float = Field(..., gt=0)
    quantity_available: Optional[int] = Field(None, gt=0)
    delivery_time: Optional[int] = Field(None, gt=0)

class QuoteCreate(QuoteBase):
    pass

class QuoteUpdate(QuoteBase):
    quoted_price: Optional[float] = Field(None, gt=0)
    vendor_id: Optional[int] = None
    order_id: Optional[int] = None

class QuoteResponse(QuoteBase):
    id: int

    model_config = {
        "from_attributes": True
    }
