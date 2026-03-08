import pytest
from ai_engines.opportunity_detector import detect_market_opportunity

def test_price_drop_opportunity():
    hist_prices = [100.0, 105.0, 95.0]  # avg = 100.0
    current = 85.0  # 15% drop
    qty = 100
    
    op = detect_market_opportunity(current, hist_prices, qty)
    
    assert op is not None
    assert op["is_opportunity"] is True
    assert "Significant price drop" in op["signals"][0]
    assert op["score"] == 30.0  # 15 * 2 = 30.0
    assert op["recommended_action"] == "Negotiate Bulk Deal"

def test_bulk_inventory_opportunity():
    hist_prices = [100.0, 100.0, 100.0]
    current = 100.0  # no drop
    qty = 600  # bulk > 500
    
    op = detect_market_opportunity(current, hist_prices, qty)
    
    assert op is not None
    assert op["is_opportunity"] is True
    assert "High bulk inventory" in op["signals"][0]
    assert op["score"] == 20.0
    
def test_synergy_opportunity():
    hist_prices = [100.0, 100.0, 100.0]
    current = 80.0  # 20% drop -> 40 points
    qty = 600  # bulk -> 20 points
    
    # Synergy bonus = 15 points. Total = 40 + 20 + 15 = 75 points
    op = detect_market_opportunity(current, hist_prices, qty)
    
    assert op is not None
    assert len(op["signals"]) == 2
    assert op["score"] == 75.0
    assert op["recommended_action"] == "Buy Now"

def test_no_opportunity():
    hist_prices = [100.0, 100.0, 100.0]
    current = 95.0  # 5% drop (below 10% threshold)
    qty = 200
    
    op = detect_market_opportunity(current, hist_prices, qty)
    assert op is None
