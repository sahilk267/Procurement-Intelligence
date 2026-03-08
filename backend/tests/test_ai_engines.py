import pytest
from backend.ai_engines.fraud_detection import calculate_fraud_score
from backend.ai_engines.opportunity_detection import detect_price_drop_opportunity
from backend.ai_engines.vendor_ranking import calculate_vendor_rating
from backend.ai_engines.ai_advisor import generate_insights

def test_fraud_detection():
    # Good vendor
    trusted_vendor = {
        "gst_number": "27AAPFU0939F1ZV",
        "website": "https://www.trusted.com",
        "email": "contact@trusted.com"
    }
    score_good = calculate_fraud_score(trusted_vendor)
    assert score_good < 40  # Should be classified as low/moderate risk

    # Bad vendor
    suspicious_vendor = {
        "email": "shadybusiness@gmail.com"
    }
    score_bad = calculate_fraud_score(suspicious_vendor)
    assert score_bad > 40  # Should be classified as high risk

def test_opportunity_detection():
    # 20% drop from 1000 average (current is 800)
    result = detect_price_drop_opportunity(
        current_price=800.0,
        historical_prices=[1000.0, 1000.0],
        threshold_percentage=15.0
    )
    assert result["is_opportunity"] is True

    # No drop
    result = detect_price_drop_opportunity(
        current_price=1050.0,
        historical_prices=[1000.0, 1000.0],
        threshold_percentage=15.0
    )
    assert result["is_opportunity"] is False

def test_vendor_ranking():
    metrics = {
        "total_quotes": 10,
        "accepted_quotes": 8,
        "avg_delivery_time": 2,
        "fraud_score": 10.0
    }
    rating = calculate_vendor_rating(metrics)
    assert rating["stars"] > 4.0

def test_ai_advisor():
    vendor_stats = [
        {"name": "Good Vendor", "stars": 4.5, "metrics": {"fraud_penalty": 10.0}},
        {"name": "Bad Vendor", "stars": 1.5, "metrics": {"fraud_penalty": 80.0}}
    ]
    opportunities = [{"category": "Servers", "drop_percentage": 25.0}]
    
    insights = generate_insights(vendor_stats, opportunities)
    assert len(insights) >= 2
    # Ensure our text mapping worked
    assert any("Strategic recommendation" in s for s in insights)
    assert any("Market Opportunity" in s for s in insights)
    assert any("High Risk" in s for s in insights)
