from typing import List, Dict, Any

def filter_vendors_for_rfq(order: Any, vendors: List[Any]) -> List[Any]:
    """
    Selects the best vendors for an RFQ based on:
    1. Category Match
    2. Brand Match
    3. Verification Status (Preference given)
    4. Fraud Score (Skip high risk)
    """
    selected_vendors = []
    
    for vendor in vendors:
        # Hard cap: Reject high fraud risk vendors (> 40.0)
        if vendor.fraud_score > 40.0:
            continue
            
        # Category check
        if order.category and vendor.category:
            if order.category.lower() != vendor.category.lower():
                continue
                
        # Brand check (if specified)
        if order.brand and vendor.brands:
            brands_lower = [b.lower() for b in vendor.brands]
            if order.brand.lower() not in brands_lower:
                continue
                
        selected_vendors.append(vendor)
        
    # Sort by verification status (Verified first) and then by lowest fraud score
    selected_vendors.sort(key=lambda x: (not x.verification_status, x.fraud_score))
    
    return selected_vendors
