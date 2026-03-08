import re
from typing import Dict, Any

def normalize_vendor_data(raw_data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Normalizes deeply unformatted raw scraping data into standard structure.
    - Cleans phone numbers
    - Guesses category from unstructured text
    - Normalizes city/area
    """
    normalized = {
        "name": str(raw_data.get("name", "")).strip().title(),
        "email": str(raw_data.get("email", "")).strip().lower(),
        "phone": _clean_phone(raw_data.get("phone", "")),
        "website": _clean_website(raw_data.get("website", "")),
        "discovery_source": raw_data.get("source", "web_scraper")
    }
    
    # Simple category extraction from raw descriptions
    desc = str(raw_data.get("description", "")).lower()
    if any(k in desc for k in ["switch", "router", "cisco", "network"]):
        normalized["category"] = "Networking"
    elif any(k in desc for k in ["server", "rack", "dell", "hp"]):
        normalized["category"] = "Servers"
    else:
        normalized["category"] = raw_data.get("category", "General IT")
        
    normalized["city"] = str(raw_data.get("city", "")).strip().title()
    normalized["area"] = str(raw_data.get("area", "")).strip().title()
    
    return normalized

def _clean_phone(phone: str) -> str:
    cleaned = re.sub(r"[^0-9+]", "", str(phone))
    return cleaned[:15]

def _clean_website(url: str) -> str:
    url = url.strip()
    if url and not url.startswith("http"):
        return f"https://{url}"
    return url
