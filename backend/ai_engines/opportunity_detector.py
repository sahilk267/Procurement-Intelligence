from typing import Dict, Any, List

def detect_market_opportunity(current_price: float, historical_prices: List[float], inventory_qty: int) -> Dict[str, Any]:
    """
    Analyzes price fluctuations and inventory levels to flag lucrative purchase opportunities.
    Returns None if no significant opportunity exists, else a dictionary with details.
    """
    if not historical_prices:
        return None
        
    avg_historical = sum(historical_prices) / len(historical_prices)
    
    opportunity_detected = False
    reasons = []
    score = 0.0
    
    # 1. Price Drop Signal
    if current_price < avg_historical:
        drop_pct = ((avg_historical - current_price) / avg_historical) * 100
        if drop_pct >= 10.0:  # 10% drop threshold
            opportunity_detected = True
            reasons.append(f"Significant price drop of {round(drop_pct, 1)}% from historical average.")
            score += drop_pct * 2.0  # Max score could balloon, cap it later
            
    # 2. Bulk Inventory Signal
    if inventory_qty >= 500: # Threshold for bulk
        opportunity_detected = True
        reasons.append(f"High bulk inventory detected ({inventory_qty} units).")
        score += 20.0
        # If both price drop AND bulk inventory exist, it's a massive opportunity
        if score > 20: 
            score += 15.0 # Synergy bonus
            
    if not opportunity_detected:
        return None
        
    final_score = min(100.0, score) # Cap at 100
    
    return {
        "is_opportunity": True,
        "score": round(final_score, 2),
        "signals": reasons,
        "recommended_action": "Buy Now" if final_score > 60 else "Negotiate Bulk Deal"
    }
