from typing import Dict, Any, List

def find_duplicate_vendor(normalized_vendor: Dict[str, Any], existing_vendors: List[Any]) -> Any:
    """
    Advanced duplicate detection using exact matches and fuzzy heuristics.
    Returns the existing Vendor DB object if a match is found, else None.
    """
    
    v_email = normalized_vendor.get("email")
    v_phone = normalized_vendor.get("phone")
    v_name = normalized_vendor.get("name", "").lower()
    
    for db_vendor in existing_vendors:
        # 1. Exact Match on high-fidelity unique constraints
        if v_email and db_vendor.email and v_email == db_vendor.email:
            return db_vendor
            
        if v_phone and db_vendor.phone and v_phone == db_vendor.phone:
            return db_vendor
            
        # 2. Fuzzy name + location match
        if db_vendor.name:
            db_name = db_vendor.name.lower()
            
            # Simple word intersection for fuzzy logic
            v_words = set(v_name.split())
            db_words = set(db_name.split())
            
            if len(v_words.intersection(db_words)) >= 2:
                # Same city = highly likely duplicate
                if normalized_vendor.get("city") == db_vendor.city:
                    return db_vendor
                    
    return None
