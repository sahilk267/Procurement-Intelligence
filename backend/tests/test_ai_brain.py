import pytest
from ai_engines.ai_brain import predict_vendor_reliability, predict_deal_outcome, calculate_profit_optimization

class MockVendor:
    def __init__(self, fraud, verified):
        self.fraud_score = fraud
        self.verification_status = verified

class MockOrder:
    def __init__(self, qty, target):
        self.quantity = qty
        self.target_price = target

class MockQuote:
    def __init__(self, q_id, v_id, price, delivery):
        self.id = q_id
        self.vendor_id = v_id
        self.quoted_price = price
        self.delivery_time = delivery

def test_predict_vendor_reliability():
    # Good vendor
    v1 = MockVendor(10.0, True)
    o1 = MockOrder(500, 1000)
    
    res1 = predict_vendor_reliability(v1, [], o1)
    assert res1["is_reliable"] is True
    assert res1["reliability_score"] == 85.0
    
    # High risk vendor
    v2 = MockVendor(55.0, False)
    o2 = MockOrder(2000, 1000) # massive quantity
    
    res2 = predict_vendor_reliability(v2, [], o2)
    assert res2["is_reliable"] is False
    assert res2["reliability_score"] < 50.0
    assert len(res2["risk_factors"]) == 3

def test_predict_deal_outcome():
    # Suspiciously low price
    q1 = MockQuote(1, 1, 400.0, 5)
    o1 = MockOrder(50, 1000.0) # Target 1000
    
    res1 = predict_deal_outcome(q1, o1, 85.0)
    assert res1["success_probability"] == 55.0  # 85 - 30
    assert "suspiciously below" in res1["warnings"][0].lower()
    
    # Normal price
    q2 = MockQuote(2, 1, 950.0, 5)
    res2 = predict_deal_outcome(q2, o1, 85.0)
    assert res2["success_probability"] == 85.0
    assert res2["recommendation"] == "Proceed"

def test_calculate_profit_optimization():
    o1 = MockOrder(50, 1000.0)
    
    # Cheap but 14 days delivery (0 ops savings) - Eff Cost: 950
    q1 = MockQuote(1, 1, 950.0, 14)
    # Expensive but 2 days delivery (8 * 50 = 400 ops savings) - Eff Cost: 1100 - 400 = 700
    q2 = MockQuote(2, 2, 1100.0, 2)
    
    res = calculate_profit_optimization([q1, q2], o1)
    
    # q2 is more expensive upfront but wildly profitable due to ops time savings
    assert res["recommended_quote_id"] == 2
