from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from schemas.quote_schema import QuoteCreate, QuoteResponse
from models.database import get_db
from models.models import Quote, Order, Vendor, NegotiationLog
from routes.auth import get_current_user
from services.quote_comparison import compare_quotes, auto_negotiate_quote

router = APIRouter()



@router.post("/", response_model=QuoteResponse)
def create_quote(quote: QuoteCreate, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    db_quote = Quote(**quote.model_dump())
    db.add(db_quote)
    
    # Auto-update Order status when a quote arrives
    order = db.query(Order).filter(Order.id == quote.order_id).first()
    if order and order.status in ["open", "RFQ Sent"]:
        order.status = "Quote Received"
        
    db.commit()
    db.refresh(db_quote)
    return db_quote

@router.get("/", response_model=List[QuoteResponse])
def read_quotes(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    quotes = db.query(Quote).offset(skip).limit(limit).all()
    return quotes

@router.put("/{quote_id}", response_model=QuoteResponse)
def update_quote(quote_id: int, quote_update: QuoteCreate, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    quote = db.query(Quote).filter(Quote.id == quote_id).first()
    if quote is None:
        raise HTTPException(status_code=404, detail="Quote not found")
    for key, value in quote_update.model_dump(exclude_unset=True).items():
        setattr(quote, key, value)
    db.commit()
    db.refresh(quote)
    return quote

@router.get("/compare/order/{order_id}")
def compare_order_quotes(order_id: int, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
        
    quotes = db.query(Quote).filter(Quote.order_id == order_id).all()
    if not quotes:
        return []
        
    # Get all unique vendor objects for the quotes
    vendor_ids = [q.vendor_id for q in quotes]
    vendors_list = db.query(Vendor).filter(Vendor.id.in_(vendor_ids)).all()
    vendors_dict = {v.id: v for v in vendors_list}
    
    ranked_quotes = compare_quotes(quotes, vendors_dict, order)
    return ranked_quotes

@router.post("/{quote_id}/auto-negotiate")
def auto_negotiate(quote_id: int, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    quote = db.query(Quote).filter(Quote.id == quote_id).first()
    if not quote:
        raise HTTPException(status_code=404, detail="Quote not found")
        
    order = db.query(Order).filter(Order.id == quote.order_id).first()
    
    result = auto_negotiate_quote(quote, order)
    
    # Persist the negotiation step if a counter-offer was made
    if result.get("action") == "negotiate":
        log = NegotiationLog(
            order_id=order.id,
            quote_id=quote.id,
            vendor_id=quote.vendor_id,
            previous_price=quote.quoted_price,
            offered_price=result["suggested_price"],
            status="counter_offered",
            message_content=result["negotiation_message"]
        )
        db.add(log)
        db.commit()
        
    return result