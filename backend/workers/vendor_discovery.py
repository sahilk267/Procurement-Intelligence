from backend.workers.celery_app import celery_app
from backend.models.database import SessionLocal
from backend.models.models import Vendor
import random
import time

MOCK_VENDORS = [
    {"name": "Elite IT Supplies", "city": "Mumbai", "area": "Lamington Road", "category": "Networking", "email": "contact@eliteit.com", "phone": "9876543210"},
    {"name": "Lamington Hardware Hub", "city": "Mumbai", "area": "Lamington Road", "category": "Servers", "email": "sales@lamingtonhub.in", "phone": "9988776655"},
    {"name": "TechPro Distributors", "city": "Delhi", "area": "Nehru Place", "category": "Desktops", "email": "info@techpro.com", "phone": "1122334455"},
]

@celery_app.task(name="workers.vendor_discovery.discover_vendors_task")
def discover_vendors_task():
    """
    Simulated task to scrape vendor data from internal/external sources
    and inject into the Vendor database.
    """
    db = SessionLocal()
    found_count = 0
    try:
        # Simulate scraping delay
        time.sleep(1.5)
        
        # In a real scenario, this involves beautifulsoup scraping IndiaMart etc.
        # Randomly pick 1-2 generic mock vendors to "discover"
        samples = random.sample(MOCK_VENDORS, k=random.randint(1, 2))

        for v_data in samples:
            # Simple dedup strategy
            existing = db.query(Vendor).filter(Vendor.email == v_data['email']).first()
            if not existing:
                vendor = Vendor(**v_data)
                db.add(vendor)
                found_count += 1
        
        if found_count > 0:
            db.commit()

        return {"status": "success", "vendors_discovered": found_count}

    except Exception as e:
        db.rollback()
        return {"status": "error", "message": str(e)}
    finally:
        db.close()
