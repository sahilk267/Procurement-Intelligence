"""
Vendor Ranking Engine
Ranks vendors based on aggregated metrics:
- Overall reliability
- Response time
- Deal success rate
- Inverse fraud score effect
"""

from typing import Dict, Any, List

def calculate_vendor_rating(metrics: Dict[str, Any]) -> Dict[str, Any]:
    """
    Given a set of metrics, generate a star rating (0.0 to 5.0) for a vendor.
    
    Expected metrics dictionary:
    {
        "total_quotes": int,
        "accepted_quotes": int,
        "avg_delivery_time": int,  # lower is better
        "fraud_score": float       # between 0 and 100
    }
    """
    total_quotes = metrics.get("total_quotes", 0)
    accepted = metrics.get("accepted_quotes", 0)
    delivery = metrics.get("avg_delivery_time", 10)
    fraud = metrics.get("fraud_score", 50.0)
    
    success_rate = (accepted / total_quotes * 100) if total_quotes > 0 else 0
    
    # 1. Success impact (Up to 2 stars)
    # 100% success = 2.0 stars. 0% = 0.0
    star_success = min(2.0, (success_rate / 100.0) * 2.0)
    
    # 2. Delivery impact (Up to 1.5 stars)
    # Delivered in <3 days = 1.5, >14 days = 0.0
    star_delivery = max(0.0, 1.5 - (delivery / 10.0))
    star_delivery = min(1.5, star_delivery)
    
    # 3. Fraud/Risk impact (Up to 1.5 stars base)
    # Low risk (0) = 1.5 stars. High risk (100) = 0
    star_trust = max(0.0, 1.5 - (fraud / 66.6))
    
    total_stars = round(star_success + star_delivery + star_trust, 1)
    
    return {
        "stars": total_stars,
        "metrics": {
            "success_rate": round(success_rate, 2),
            "fraud_penalty": round(fraud, 2)
        }
    }
