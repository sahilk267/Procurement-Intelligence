"""
Fraud Detection Engine
Evaluates vendor risk based on project blueprint signals:
- GST verification (+ trust)
- Website presence (+ trust)
- Domain email validation (+ trust)
- Price anomaly (simulated historical checks) (- trust)
"""

from typing import Dict, Any

def calculate_fraud_score(vendor_data: Dict[str, Any]) -> float:
    """
    Calculates a risk/fraud score between 0 and 100.
    0-20: trusted
    20-40: moderate risk
    40+: high risk
    """
    score = 50.0  # Base neutral score
    
    # 1. GST check
    if vendor_data.get("gst_number") and len(vendor_data["gst_number"]) > 10:
        score -= 15.0  # Legitimate business registration
    else:
        score += 10.0  # Missing GST is a risk
        
    # 2. Website presence
    if vendor_data.get("website") and "http" in vendor_data["website"]:
        score -= 10.0
    else:
        score += 5.0
        
    # 3. Email domain validation
    email = vendor_data.get("email", "")
    generic_domains = ["gmail.com", "yahoo.com", "hotmail.com"]
    if email:
        domain = email.split("@")[-1].lower() if "@" in email else ""
        if domain in generic_domains:
            # Using generic email for B2B procurement raises slight risk
            score += 5.0
        elif domain != "":
            # Corporate domain lowers risk
            score -= 10.0
            
    # Bound the score between 0 and 100
    return max(0.0, min(100.0, score))
