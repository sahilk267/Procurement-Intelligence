import pytest
from services.quote_comparison import compare_quotes, auto_negotiate_quote

class MockVendor:
    def __init__(self, v_id, name, verification, rating):
        self.id = v_id
        self.name = name
        self.verification_status = verification
        self.google_rating = rating

class MockQuote:
    def __init__(self, q_id, v_id, price, delivery, qty):
        self.id = q_id
        self.vendor_id = v_id
        self.quoted_price = price
        self.delivery_time = delivery
        self.quantity_available = qty

class MockOrder:
    def __init__(self, target, qty):
        self.target_price = target
        self.quantity = qty

def test_compare_quotes():
    order = MockOrder(100.0, 50)
    
    v1 = MockVendor(1, "Trusted IT", True, 4.5)
    v2 = MockVendor(2, "Cheap Gear", False, 3.2)
    
    q1 = MockQuote(101, 1, price=105.0, delivery=2, qty=50)   # Over budget but fast, verified, full qty
    q2 = MockQuote(102, 2, price=95.0, delivery=10, qty=20)   # Under budget but slow, unverified, partial qty
    
    vendors = {1: v1, 2: v2}
    ranked = compare_quotes([q1, q2], vendors, order)
    
    assert len(ranked) == 2
    # q1 should win because of high vendor score (+20), fast delivery (+30), and full quantity. Price is -5% (45 pts) = 95
    # q2 should lose because partial qty (-15), slow delivery (15), low vendor score (+5), price (+50) = 55
    assert ranked[0]["quote_id"] == 101
    assert ranked[1]["quote_id"] == 102
    assert ranked[0]["total_score"] > ranked[1]["total_score"]

def test_auto_negotiation():
    order = MockOrder(100.0, 50)
    
    q_beat = MockQuote(1, 1, 95.0, 2, 50)
    res_beat = auto_negotiate_quote(q_beat, order)
    assert res_beat["action"] == "accept"
    
    q_close = MockQuote(2, 1, 110.0, 2, 50) # 10% over
    res_close = auto_negotiate_quote(q_close, order)
    assert res_close["action"] == "negotiate"
    assert res_close["suggested_price"] == 105.0
    
    q_far = MockQuote(3, 1, 150.0, 2, 50) # 50% over
    res_far = auto_negotiate_quote(q_far, order)
    assert res_far["action"] == "reject"
