import re
from pydantic import BaseModel, Field, EmailStr, field_validator
from typing import List, Optional

class VendorBase(BaseModel):
    name: str = Field(..., min_length=2)
    city: Optional[str] = None
    area: Optional[str] = None
    category: Optional[str] = None
    brands: Optional[List[str]] = None
    product_condition: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    website: Optional[str] = None
    gst_number: Optional[str] = None
    discovery_source: Optional[str] = "manual"
    years_in_business: Optional[int] = None
    employee_count: Optional[int] = None
    google_rating: Optional[float] = None

    @field_validator('phone', mode='before')
    @classmethod
    def clean_phone(cls, v: Optional[str]) -> Optional[str]:
        if not v:
            return v
        cleaned = re.sub(r"[^0-9+]", "", str(v))
        return cleaned[:15]

    @field_validator('website', mode='before')
    @classmethod
    def clean_website(cls, v: Optional[str]) -> Optional[str]:
        if not v:
            return v
        v = v.strip()
        if v and not v.startswith("http"):
            return f"https://{v}"
        return v

class VendorCreate(VendorBase):
    pass

class VendorUpdate(VendorBase):
    name: Optional[str] = Field(None, min_length=2)

class VendorResponse(VendorBase):
    id: int
    verification_status: bool
    fraud_score: float

    model_config = {
        "from_attributes": True
    }
