from typing import Dict, Any

def calculate_vendor_composite_score(vendor_metrics: Dict[str, Any]) -> Dict[str, Any]:
    """
    Vendor scoring composite based on Phase 2 specifications.
    vendor_score = rating_score + location_score + response_score + fraud_score
    """
    
    # 1. Rating Score (Max 40 points)
    # google_rating is out of 5.0
    g_rating = vendor_metrics.get("google_rating") or 3.0
    rating_score = (g_rating / 5.0) * 40.0
    
    # 2. Location Score (Max 30 points)
    # Lamington Road priority: Lamington Road = 30, Mumbai = 20, Maharashtra = 10, Other = 0
    area = (vendor_metrics.get("area") or "").lower()
    city = (vendor_metrics.get("city") or "").lower()
    
    location_score = 0.0
    if "lamington" in area:
        location_score = 30.0
    elif "mumbai" in city or "mumbai" in area:
        location_score = 20.0
    
    # 3. Response Score (Max 20 points)
    # Fast response = 20 points
    response_time = vendor_metrics.get("avg_response_time_hours") or 24.0
    response_score = max(0.0, 20.0 - (response_time / 2.0))
    response_score = min(20.0, response_score)
    
    # 4. Fraud Risk Impact (Max 10 points)
    # Low fraud score (0) = 10 points, High fraud score (100) = 0 points
    fraud = vendor_metrics.get("fraud_score") or 0.0
    fraud_score = max(0.0, 10.0 - (fraud / 10.0))
    
    total_score = rating_score + location_score + response_score + fraud_score
    
    return {
        "total_score": round(total_score, 2),
        "breakdown": {
            "rating_score": round(rating_score, 2),
            "location_score": round(location_score, 2),
            "response_score": round(response_score, 2),
            "fraud_score": round(fraud_score, 2)
        }
    }
