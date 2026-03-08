from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from pydantic import BaseModel
from datetime import date
from models.database import get_db
from models.models import Order
from backend.workers.rfq_broadcaster import broadcast_rfq_task
from routes.auth import get_current_user

router = APIRouter()

class OrderCreate(BaseModel):
    product_name: str
    brand: Optional[str] = None
    category: Optional[str] = None
    quantity: int
    target_price: Optional[float] = None
    condition: Optional[str] = None
    location: Optional[str] = None
    deadline: Optional[date] = None

class OrderResponse(BaseModel):
    id: int
    product_name: str
    brand: Optional[str]
    category: Optional[str]
    quantity: int
    target_price: Optional[float]
    condition: Optional[str]
    location: Optional[str]
    deadline: Optional[date]
    status: str

@router.post("/", response_model=OrderResponse)
def create_order(order: OrderCreate, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    db_order = Order(**order.dict(), created_by=current_user.id)
    db.add(db_order)
    db.commit()
    db.refresh(db_order)
    return db_order

@router.get("/", response_model=List[OrderResponse])
def read_orders(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    orders = db.query(Order).offset(skip).limit(limit).all()
    return orders

@router.get("/{order_id}", response_model=OrderResponse)
def read_order(order_id: int, db: Session = Depends(get_db)):
    order = db.query(Order).filter(Order.id == order_id).first()
    if order is None:
        raise HTTPException(status_code=404, detail="Order not found")
    return order

@router.put("/{order_id}", response_model=OrderResponse)
def update_order(order_id: int, order_update: OrderCreate, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    order = db.query(Order).filter(Order.id == order_id).first()
    if order is None:
        raise HTTPException(status_code=404, detail="Order not found")
    for key, value in order_update.dict(exclude_unset=True).items():
        setattr(order, key, value)
    db.commit()
    db.refresh(order)
    return order

@router.delete("/{order_id}")
def delete_order(order_id: int, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    order = db.query(Order).filter(Order.id == order_id).first()
    if order is None:
        raise HTTPException(status_code=404, detail="Order not found")
    db.delete(order)
    db.commit()
    return {"message": "Order deleted"}

@router.post("/{order_id}/send-rfq")
def send_rfq(order_id: int, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    order = db.query(Order).filter(Order.id == order_id).first()
    if order is None:
        raise HTTPException(status_code=404, detail="Order not found")
    
    # Trigger the RFQ background worker
    broadcast_rfq_task.delay(order.id, current_user.id)
    
    return {"message": "RFQ broadcast triggered in background."}