from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from pydantic import BaseModel
from models.models import Vendor
from routes.auth import get_current_user
from backend.ai_engines.fraud_detection import calculate_fraud_score

router = APIRouter()

class VendorCreate(BaseModel):
    name: str
    city: Optional[str] = None
    area: Optional[str] = None
    category: Optional[str] = None
    brands: Optional[List[str]] = None
    product_condition: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    website: Optional[str] = None
    gst_number: Optional[str] = None

class VendorResponse(BaseModel):
    id: int
    name: str
    city: Optional[str]
    area: Optional[str]
    category: Optional[str]
    brands: Optional[List[str]]
    product_condition: Optional[str]
    email: Optional[str]
    phone: Optional[str]
    website: Optional[str]
    gst_number: Optional[str]
    verification_status: bool
    fraud_score: float

@router.post("/", response_model=VendorResponse)
def create_vendor(vendor: VendorCreate, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    vendor_dict = vendor.dict()
    
    # Calculate Fraud Score using our AI Engine
    vendor_score = calculate_fraud_score(vendor_dict)
    
    db_vendor = Vendor(**vendor_dict, fraud_score=vendor_score)
    db.add(db_vendor)
    db.commit()
    db.refresh(db_vendor)
    return db_vendor

@router.get("/", response_model=List[VendorResponse])
def read_vendors(
    skip: int = 0,
    limit: int = 100,
    city: Optional[str] = Query(None),
    category: Optional[str] = Query(None),
    verification_status: Optional[bool] = Query(None),
    product_condition: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    query = db.query(Vendor)
    if city:
        query = query.filter(Vendor.city == city)
    if category:
        query = query.filter(Vendor.category == category)
    if verification_status is not None:
        query = query.filter(Vendor.verification_status == verification_status)
    if product_condition:
        query = query.filter(Vendor.product_condition == product_condition)
    vendors = query.offset(skip).limit(limit).all()
    return vendors

@router.get("/{vendor_id}", response_model=VendorResponse)
def read_vendor(vendor_id: int, db: Session = Depends(get_db)):
    vendor = db.query(Vendor).filter(Vendor.id == vendor_id).first()
    if vendor is None:
        raise HTTPException(status_code=404, detail="Vendor not found")
    return vendor

@router.put("/{vendor_id}", response_model=VendorResponse)
def update_vendor(vendor_id: int, vendor_update: VendorCreate, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    vendor = db.query(Vendor).filter(Vendor.id == vendor_id).first()
    if vendor is None:
        raise HTTPException(status_code=404, detail="Vendor not found")
    for key, value in vendor_update.dict(exclude_unset=True).items():
        setattr(vendor, key, value)
    db.commit()
    db.refresh(vendor)
    return vendor

@router.delete("/{vendor_id}")
def delete_vendor(vendor_id: int, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    vendor = db.query(Vendor).filter(Vendor.id == vendor_id).first()
    if vendor is None:
        raise HTTPException(status_code=404, detail="Vendor not found")
    db.delete(vendor)
    db.commit()
    return {"message": "Vendor deleted"}

@router.post("/{vendor_id}/verify")
def verify_vendor(vendor_id: int, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    vendor = db.query(Vendor).filter(Vendor.id == vendor_id).first()
    if vendor is None:
        raise HTTPException(status_code=404, detail="Vendor not found")
    vendor.verification_status = True
    db.commit()
    return {"message": "Vendor verified"}

@router.post("/{vendor_id}/flag")
def flag_vendor(vendor_id: int, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    vendor = db.query(Vendor).filter(Vendor.id == vendor_id).first()
    if vendor is None:
        raise HTTPException(status_code=404, detail="Vendor not found")
    vendor.fraud_score = min(vendor.fraud_score + 0.1, 1.0)  # Increase fraud score
    db.commit()
    return {"message": "Vendor flagged"}