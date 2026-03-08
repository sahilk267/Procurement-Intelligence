"""
AI Advisor Engine
Analyzes platform data and recommends decisions contextually.
Generates human-readable strategic insights.
"""

from typing import List, Dict, Any

def generate_insights(vendor_stats: List[Dict[str, Any]], price_opportunities: List[Dict[str, Any]]) -> List[str]:
    """
    Examines the platform context and provides strategic advisory text.
    """
    insights = []
    
    # Analyze best vendor based on success rating
    if vendor_stats:
        top_vendor = max(vendor_stats, key=lambda x: x.get("stars", 0))
        if top_vendor.get("stars", 0) >= 4.0:
            insights.append(f"Strategic recommendation: '{top_vendor['name']}' has a highly reliable {top_vendor['stars']}-star rating. Prioritize them for critical deliveries.")
        
        risky_vendor = min(vendor_stats, key=lambda x: x.get("stars", 5.0))
        if risky_vendor.get("metrics", {}).get("fraud_penalty", 0) > 40:
            insights.append(f"Warning: '{risky_vendor['name']}' is marked as High Risk. Conduct manual verification before closing large deals.")

    # Opportunity analytics
    if price_opportunities:
        best_op = max(price_opportunities, key=lambda x: x.get("drop_percentage", 0))
        insights.append(f"Market Opportunity: Massive {best_op['drop_percentage']}% price drop detected on {best_op.get('category', 'Hardware')}.")
        
    if not insights:
        insights.append("Sufficient data not gathered to generate new strategic recommendations today. Keep processing RFQs.")
        
    return insights
