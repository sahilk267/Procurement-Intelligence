from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from models.database import get_db
from models.models import Vendor, Order, Quote, Lead, PriceHistory
from routes.auth import get_current_user
from backend.ai_engines.vendor_ranking import calculate_vendor_rating
from backend.ai_engines.ai_advisor import generate_insights

router = APIRouter()

@router.get("/vendors")
def get_vendor_analytics(db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    total_vendors = db.query(func.count(Vendor.id)).scalar()
    verified_vendors = db.query(func.count(Vendor.id)).filter(Vendor.verification_status == True).scalar()
    avg_fraud_score = db.query(func.avg(Vendor.fraud_score)).scalar()
    return {
        "total_vendors": total_vendors,
        "verified_vendors": verified_vendors,
        "avg_fraud_score": float(avg_fraud_score) if avg_fraud_score else 0.0
    }

@router.get("/deals")
def get_deal_analytics(db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    total_orders = db.query(func.count(Order.id)).scalar()
    open_orders = db.query(func.count(Order.id)).filter(Order.status == "open").scalar()
    closed_deals = db.query(func.count(Order.id)).filter(Order.status == "deal_closed").scalar()
    return {
        "total_orders": total_orders,
        "open_orders": open_orders,
        "closed_deals": closed_deals
    }

@router.get("/prices")
def get_price_analytics(db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    # Basic price analytics - in real implementation, would be more complex
    avg_quote_price = db.query(func.avg(Quote.quoted_price)).scalar()
    return {
        "avg_quote_price": float(avg_quote_price) if avg_quote_price else 0.0
    }

@router.get("/leads")
def get_lead_analytics(db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    total_leads = db.query(func.count(Lead.id)).scalar()
    new_leads = db.query(func.count(Lead.id)).filter(Lead.status == "new").scalar()
    converted_leads = db.query(func.count(Lead.id)).filter(Lead.status == "converted").scalar()
    return {
        "total_leads": total_leads,
        "new_leads": new_leads,
        "converted_leads": converted_leads
    }

@router.get("/vendor-rankings")
def get_vendor_rankings(db: Session = Depends(get_db)):
    """
    Returns vendors sorted dynamically by our Vendor Ranking Engine.
    """
    vendors = db.query(Vendor).all()
    ranked_vendors = []
    
    for v in vendors:
        # Fetch actual metrics for this vendor
        total_quotes = db.query(func.count(Quote.id)).filter(Quote.vendor_id == v.id).scalar()
        
        # Accepted quotes are those where the order deal_closed
        accepted_quotes = db.query(func.count(Quote.id)).join(Order, Quote.order_id == Order.id).filter(
            Quote.vendor_id == v.id,
            Order.status == 'deal_closed'
        ).scalar()
        
        avg_delivery = db.query(func.avg(Quote.delivery_time)).filter(Quote.vendor_id == v.id).scalar() or 10
        
        metrics = {
            "total_quotes": total_quotes,
            "accepted_quotes": accepted_quotes,
            "avg_delivery_time": float(avg_delivery),
            "fraud_score": float(v.fraud_score or 50.0)
        }
        
        rating = calculate_vendor_rating(metrics)
        
        ranked_vendors.append({
            "vendor_id": v.id,
            "name": v.name,
            "category": v.category,
            "stars": rating["stars"],
            "metrics": rating["metrics"]
        })
        
    # Sort descending by stars
    ranked_vendors.sort(key=lambda x: x["stars"], reverse=True)
    return ranked_vendors

@router.get("/advisor-insights")
def get_advisor_insights(db: Session = Depends(get_db)):
    """
    Uses the AI Advisor engine to generate strategic text recommendations.
    """
    # 1. Gather Vendor States
    vendors = db.query(Vendor).all()
    vendor_stats = []
    for v in vendors:
        total_quotes = db.query(func.count(Quote.id)).filter(Quote.vendor_id == v.id).scalar()
        accepted_quotes = db.query(func.count(Quote.id)).join(Order).filter(Quote.vendor_id == v.id, Order.status == 'deal_closed').scalar()
        avg_delivery = db.query(func.avg(Quote.delivery_time)).filter(Quote.vendor_id == v.id).scalar() or 10
        
        metrics = {"total_quotes": total_quotes, "accepted_quotes": accepted_quotes, "avg_delivery_time": float(avg_delivery), "fraud_score": float(v.fraud_score or 50.0)}
        rating = calculate_vendor_rating(metrics)
        
        vendor_stats.append({
            "name": v.name,
            "stars": rating["stars"],
            "metrics": rating["metrics"]
        })
        
    # 2. Gather active opportunities (from latest price drops)
    # Simple heuristic for dummy engine matching:
    opportunities = []
    latest_prices = db.query(PriceHistory).order_by(PriceHistory.recorded_at.desc()).limit(10).all()
    for ph in latest_prices:
        # In real-world, 'Opportunity Detection Engine' would have logged a 
        # specific Drop Alert. Here we mock passing recent drops if cheap.
        if float(ph.price) < 10000:
            opportunities.append({"category": ph.category, "drop_percentage": 18.5})
            
    # 3. Generate insights
    insights = generate_insights(vendor_stats, opportunities)
    return {"strategic_insights": insights}