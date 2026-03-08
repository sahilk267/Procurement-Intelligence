"""
Opportunity Detection Engine
Detects market signals such as bulk liquidation or massive price drops.
"""

from decimal import Decimal
from typing import List, Dict, Any

def detect_price_drop_opportunity(
    current_price: float, 
    historical_prices: List[float], 
    threshold_percentage: float = 15.0
) -> Dict[str, Any]:
    """
    Compares a new price against historical average.
    Returns an opportunity alert if the price drop is significant.
    """
    if not historical_prices:
        return {"is_opportunity": False, "message": "No historical data to compare."}
        
    avg_price = sum(historical_prices) / len(historical_prices)
    
    if current_price < avg_price:
        drop_percent = ((avg_price - current_price) / avg_price) * 100
        
        if drop_percent >= threshold_percentage:
            return {
                "is_opportunity": True, 
                "drop_percentage": round(drop_percent, 2),
                "message": f"Massive price drop detected! Current price is {round(drop_percent, 2)}% below market average."
            }
            
    return {"is_opportunity": False, "message": "Normal market variance."}
