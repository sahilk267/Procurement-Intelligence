from pydantic import BaseModel, EmailStr
from typing import Optional

class LeadBase(BaseModel):
    company_name: str
    contact_person: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    interest_category: Optional[str] = None
    source: Optional[str] = None

class LeadCreate(LeadBase):
    pass

class LeadUpdate(LeadBase):
    company_name: Optional[str] = None

class LeadResponse(LeadBase):
    id: int
    status: str

    model_config = {
        "from_attributes": True
    }
