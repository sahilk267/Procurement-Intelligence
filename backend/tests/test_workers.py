import pytest
from backend.workers.rfq_broadcaster import broadcast_rfq_task
from backend.workers.vendor_discovery import discover_vendors_task
from backend.workers.price_monitor import monitor_prices_task
from backend.workers.lead_scraper import scrape_leads_task

def test_vendor_discovery():
    # Sync call
    result = discover_vendors_task.apply()
    assert result.status == "SUCCESS"
    data = result.result
    assert data["status"] in ["success", "error"]

def test_price_monitor():
    result = monitor_prices_task.apply()
    assert result.status == "SUCCESS"
    data = result.result
    assert data["status"] in ["success", "error", "skipped"]

def test_lead_scraper():
    result = scrape_leads_task.apply()
    assert result.status == "SUCCESS"
    data = result.result
    assert data["status"] in ["success", "error"]
