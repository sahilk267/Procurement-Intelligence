from typing import List, Dict, Any

def compare_quotes(quotes: List[Any], vendors: Dict[int, Any], order: Any) -> List[Dict[str, Any]]:
    """
    Evaluates quotes submitted for an order.
    Returns a sorted list of quotes based on best score.
    """
    scored_quotes = []
    
    for quote in quotes:
        vendor = vendors.get(quote.vendor_id)
        if not vendor:
            continue
            
        # 1. Price Score: Lower is better. Max 50 points.
        # Relative to target price. If below target, gets high points.
        target = order.target_price or quote.quoted_price
        # ratio < 1 means good deal (price < target)
        price_ratio = float(quote.quoted_price) / float(target) if target > 0 else 1.0
        
        if price_ratio <= 1.0:
            price_score = 50.0  # Perfect score for hitting/beating target
        else:
            # Dimsinishing returns as price goes up
            price_score = max(0.0, 50.0 - ((price_ratio - 1.0) * 100))
            
        # 2. Delivery Time Score: Max 30 points
        # 1-3 days = 30 points, 7 days = 10, >14 days = 0
        delivery = float(quote.delivery_time) if quote.delivery_time else 7.0
        if delivery <= 3.0:
            delivery_score = 30.0
        elif delivery <= 7.0:
            delivery_score = 20.0
        else:
            delivery_score = max(0.0, 30.0 - (delivery * 1.5))
            
        # 3. Vendor Capability Score: Max 20 points
        # Verification, High rating, etc.
        v_score = 0.0
        if vendor.verification_status:
            v_score += 10.0
        if vendor.google_rating and vendor.google_rating >= 4.0:
            v_score += 10.0
        elif vendor.google_rating and vendor.google_rating >= 3.0:
            v_score += 5.0
            
        # Discount points if quantity isn't fully met
        quantity_penalty = 0.0
        if quote.quantity_available and quote.quantity_available < order.quantity:
            quantity_penalty = 15.0  # Big penalty for partial orders
            
        total_score = max(0.0, (price_score + delivery_score + v_score) - quantity_penalty)
        
        scored_quotes.append({
            "quote_id": quote.id,
            "vendor_id": vendor.id,
            "vendor_name": vendor.name,
            "price": float(quote.quoted_price),
            "delivery_time": quote.delivery_time,
            "quantity_available": quote.quantity_available,
            "total_score": round(total_score, 2),
            "breakdown": {
                "price_score": round(price_score, 2),
                "delivery_score": round(delivery_score, 2),
                "vendor_score": round(v_score, 2),
                "penalty": round(quantity_penalty, 2)
            }
        })
        
    # Sort highest score first
    scored_quotes.sort(key=lambda x: x["total_score"], reverse=True)
    return scored_quotes

def auto_negotiate_quote(quote: Any, order: Any) -> Dict[str, Any]:
    """
    Evaluates a single quote against the order's constraints and generates an auto-counter-offer
    if the pricing is off but within a negotiable threshold (e.g. 15%).
    """
    target = float(order.target_price) if order.target_price else None
    
    if not target:
        return {"action": "accept", "message": "No target price to negotiate against."}
        
    quoted = float(quote.quoted_price)
    margin_diff = (quoted - target) / target
    
    if margin_diff <= 0:
        return {
            "action": "accept", 
            "message": "Quote meets or beats target price. Ready to close."
        }
    elif margin_diff <= 0.15:
        # Counter-offer logic: ask to match target or meet halfway
        halfway = target + ((quoted - target) * 0.5)
        return {
            "action": "negotiate",
            "suggested_price": round(halfway, 2),
            "negotiation_message": f"Your quote is slightly above our target limit. Can you do {round(halfway, 2)}?"
        }
    else:
        # Too expensive
        return {
            "action": "reject",
            "message": "Quote significantly exceeds budget limit."
        }
