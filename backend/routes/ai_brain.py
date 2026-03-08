from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from models.database import get_db
from models.models import Vendor, Order, Quote
from routes.auth import get_current_user
from backend.ai_engines.ai_brain import predict_vendor_reliability, predict_deal_outcome, calculate_profit_optimization

router = APIRouter()

@router.get("/vendor/{vendor_id}/reliability")
def get_vendor_reliability(vendor_id: int, order_id: int, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    vendor = db.query(Vendor).filter(Vendor.id == vendor_id).first()
    order = db.query(Order).filter(Order.id == order_id).first()
    
    if not vendor or not order:
        raise HTTPException(status_code=404, detail="Entity not found")
        
    # Historical orders logic mocked for now
    history = []
    
    prediction = predict_vendor_reliability(vendor, history, order)
    return prediction

@router.get("/order/{order_id}/outcome")
def get_deal_outcome_prediction(order_id: int, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
        
    quotes = db.query(Quote).filter(Quote.order_id == order_id).all()
    if not quotes:
        return {"message": "No quotes arrived yet to predict outcome."}
        
    # Analyze all quotes
    predictions = []
    for q in quotes:
        vendor = db.query(Vendor).filter(Vendor.id == q.vendor_id).first()
        rel_score = predict_vendor_reliability(vendor, [], order)["reliability_score"]
        
        outcome = predict_deal_outcome(q, order, rel_score)
        predictions.append({
            "quote_id": q.id,
            "vendor_name": vendor.name,
            "success_probability": outcome["success_probability"],
            "warnings": outcome["warnings"],
            "recommendation": outcome["recommendation"]
        })
        
    return predictions

@router.get("/order/{order_id}/optimize")
def get_profit_optimization(order_id: int, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
        
    quotes = db.query(Quote).filter(Quote.order_id == order_id).all()
    if not quotes:
        return {"status": "error", "message": "No quotes to optimize"}
        
    optimization = calculate_profit_optimization(quotes, order)
    return optimization

# Blueprint Aligned Aliases
@router.get("/recommendations")
def get_ai_recommendations(db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    """
    Blueprint: GET /ai/recommendations
    Returns high-level recommendations for active orders.
    """
    active_orders = db.query(Order).filter(Order.status != "Closed").all()
    recommendations = []
    for order in active_orders:
        quotes = db.query(Quote).filter(Quote.order_id == order.id).all()
        if quotes:
            opt = calculate_profit_optimization(quotes, order)
            recommendations.append({
                "order_id": order.id,
                "product": order.product_name,
                "best_quote_id": opt["recommended_quote_id"],
                "analysis": opt["strategic_analysis"]
            })
    return recommendations

@router.get("/predictions")
def get_ai_predictions(db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    """
    Blueprint: GET /ai/predictions
    Returns outcome predictions for all active RFQs.
    """
    active_orders = db.query(Order).filter(Order.status == "RFQ Sent").all()
    predictions = []
    for order in active_orders:
        quotes = db.query(Quote).filter(Quote.order_id == order.id).all()
        for q in quotes:
            vendor = db.query(Vendor).filter(Vendor.id == q.vendor_id).first()
            rel = predict_vendor_reliability(vendor, [], order)["reliability_score"]
            outcome = predict_deal_outcome(q, order, rel)
            predictions.append({
                "order_id": order.id,
                "quote_id": q.id,
                "vendor": vendor.name,
                "success_probability": outcome["success_probability"]
            })
    return predictions
