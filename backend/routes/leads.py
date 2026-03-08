from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from schemas.lead_schema import LeadCreate, LeadResponse
from models.database import get_db
from models.models import Lead
from routes.auth import get_current_user

router = APIRouter()



@router.post("/", response_model=LeadResponse)
def create_lead(lead: LeadCreate, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    db_lead = Lead(**lead.model_dump())
    db.add(db_lead)
    db.commit()
    db.refresh(db_lead)
    return db_lead

@router.get("/", response_model=List[LeadResponse])
def read_leads(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    leads = db.query(Lead).offset(skip).limit(limit).all()
    return leads

@router.put("/{lead_id}", response_model=LeadResponse)
def update_lead(lead_id: int, lead_update: LeadCreate, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    lead = db.query(Lead).filter(Lead.id == lead_id).first()
    if lead is None:
        raise HTTPException(status_code=404, detail="Lead not found")
    for key, value in lead_update.model_dump(exclude_unset=True).items():
        setattr(lead, key, value)
    db.commit()
    db.refresh(lead)
    return lead