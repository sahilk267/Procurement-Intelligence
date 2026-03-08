from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from sqlalchemy import func
from models.database import get_db
from models.models import PriceHistory, Opportunity
from routes.auth import get_current_user

router = APIRouter()

@router.get("/history")
def get_price_history(
    product_name: str, 
    brand: Optional[str] = None, 
    db: Session = Depends(get_db), 
    current_user = Depends(get_current_user)
):
    """
    Returns chronological price movement for a specific product.
    """
    query = db.query(PriceHistory).filter(PriceHistory.product_name.ilike(f"%{product_name}%"))
    if brand:
        query = query.filter(PriceHistory.brand.ilike(f"%{brand}%"))
    
    return query.order_by(PriceHistory.recorded_at.desc()).all()

@router.get("/average")
def get_average_prices(db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    """
    Returns average prices grouped by category.
    """
    stats = db.query(
        PriceHistory.category,
        func.avg(PriceHistory.price).label("avg_price"),
        func.min(PriceHistory.price).label("min_price"),
        func.max(PriceHistory.price).label("max_price"),
        func.count(PriceHistory.id).label("data_points")
    ).group_by(PriceHistory.category).all()
    
    return [
        {
            "category": s.category,
            "avg_price": round(float(s.avg_price), 2),
            "min_price": float(s.min_price),
            "max_price": float(s.max_price),
            "data_points": s.data_points
        } for s in stats
    ]

@router.get("/opportunities")
def get_price_opportunities(db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    """
    Returns active high-margin signals from the Opportunity engine.
    """
    return db.query(Opportunity).filter(
        Opportunity.status == "detected",
        Opportunity.score > 70.0
    ).order_by(Opportunity.score.desc()).all()
