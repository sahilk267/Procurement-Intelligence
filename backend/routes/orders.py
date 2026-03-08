from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime, date
from typing import List, Optional
from schemas.order_schema import OrderCreate, OrderResponse
from datetime import date
from models.database import get_db
from models.models import Order, Quote
from backend.workers.rfq_broadcaster import broadcast_rfq_task
from routes.auth import get_current_user

router = APIRouter()



@router.post("/", response_model=OrderResponse)
def create_order(order: OrderCreate, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    db_order = Order(**order.model_dump(), created_by=current_user.id)
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
    for key, value in order_update.model_dump(exclude_unset=True).items():
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

@router.get("/{order_id}/quotes")
def get_order_quotes(order_id: int, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    order = db.query(Order).filter(Order.id == order_id).first()
    if order is None:
        raise HTTPException(status_code=404, detail="Order not found")
        
    quotes = db.query(Quote).filter(Quote.order_id == order_id).all()
    return quotes

@router.post("/{order_id}/close")
def close_deal(order_id: int, winning_quote_id: int, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
        
    quote = db.query(Quote).filter(Quote.id == winning_quote_id, Quote.order_id == order_id).first()
    if not quote:
        raise HTTPException(status_code=404, detail="Winning quote not found or does not belong to this order")
        
    order.status = "Closed"
    order.updated_at = datetime.utcnow()
    
    db.commit()
    return {
        "message": "Deal closed successfully",
        "order_id": order.id,
        "winning_quote_id": quote.id,
        "final_price": float(quote.quoted_price)
    }