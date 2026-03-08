from typing import Dict, Any, List
import random

def predict_vendor_reliability(vendor: Any, order_history: List[Any], current_order: Any) -> Dict[str, Any]:
    """
    Simulates ML model predicting if a vendor will reliably fulfill an order.
    Returns probability [0.0 - 1.0] and risk factors.
    """
    base_prob = 0.85
    risk_factors = []
    
    if vendor.fraud_score and vendor.fraud_score > 30:
        base_prob -= 0.25
        risk_factors.append("High fraud score")
        
    if vendor.verification_status is False:
        base_prob -= 0.15
        risk_factors.append("Unverified vendor")
        
    # Check if quantity requested is huge vs typical
    if current_order.quantity > 1000:
        base_prob -= 0.10
        risk_factors.append("Exceptionally large order size for typical supplier")
        
    # Bound probability
    final_prob = max(0.01, min(0.99, base_prob))
    
    return {
        "reliability_score": round(final_prob * 100, 1),
        "is_reliable": final_prob > 0.70,
        "risk_factors": risk_factors
    }

def predict_deal_outcome(quote: Any, order: Any, vendor_reliability: float) -> Dict[str, Any]:
    """
    Predicts the likelihood of a deal closing successfully (no returns/delays) based on price & reliability.
    """
    target = order.target_price or quote.quoted_price
    price_ratio = quote.quoted_price / target if target else 1.0
    
    # If price is suspiciously low (< 60% of target), outcome risk jumps (counterfeit, bait-and-switch)
    suspicious_pricing = price_ratio < 0.60
    
    outcome_score = vendor_reliability
    warnings = []
    
    if suspicious_pricing:
        outcome_score -= 30.0
        warnings.append("Price is suspiciously below market average. High risk of fulfillment failure.")
        
    # High price but reliable
    if price_ratio > 1.20:
        warnings.append("Price is significantly above target, reducing ROI.")
        
    return {
        "success_probability": round(max(0.0, outcome_score), 1),
        "warnings": warnings,
        "recommendation": "Proceed" if outcome_score > 75 and not suspicious_pricing else "Review Carefully"
    }

def calculate_profit_optimization(quotes: List[Any], order: Any) -> Dict[str, Any]:
    """
    Identifies the most profitable route. Sometimes lowest price isn't best if delivery is too slow.
    """
    if not quotes:
        return {"status": "error", "message": "No quotes provided"}
        
    # For simulation, we assume early delivery saves $50/day in operational costs
    daily_cost_savings = 50.0 
    
    best_roi_quote = None
    best_roi_value = -999999.0
    
    analysis = []
    
    base_benchmark_days = 10 # Anything under 10 days generates savings
    
    for q in quotes:
        price = float(q.quoted_price)
        days = q.delivery_time or 14
        
        # Calculate nominal operational savings from fast delivery
        ops_savings = max(0, (base_benchmark_days - days) * daily_cost_savings)
        
        # Effective cost = Price - abstract strategic savings
        effective_cost = price - ops_savings
        
        if -effective_cost > best_roi_value:
            best_roi_value = -effective_cost
            best_roi_quote = q
            
        analysis.append({
            "quote_id": q.id,
            "vendor_id": q.vendor_id,
            "raw_price": price,
            "effective_strategic_cost": effective_cost,
            "time_saved_value": ops_savings
        })
        
    return {
        "recommended_quote_id": best_roi_quote.id if best_roi_quote else None,
        "strategic_analysis": analysis
    }
