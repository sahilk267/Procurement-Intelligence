from pydantic import BaseModel, Field
from typing import Optional
from datetime import date

class OrderBase(BaseModel):
    product_name: str = Field(..., min_length=2)
    brand: Optional[str] = None
    category: Optional[str] = None
    quantity: int = Field(..., gt=0)
    target_price: Optional[float] = Field(None, gt=0)
    condition: Optional[str] = None
    location: Optional[str] = None
    deadline: Optional[date] = None

class OrderCreate(OrderBase):
    pass

class OrderUpdate(OrderBase):
    product_name: Optional[str] = Field(None, min_length=2)
    quantity: Optional[int] = Field(None, gt=0)

class OrderResponse(OrderBase):
    id: int
    status: str

    model_config = {
        "from_attributes": True
    }
